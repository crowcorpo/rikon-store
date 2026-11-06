import { useState, useEffect, useCallback } from 'react';
import { supabase } from './superbase.ts';
import './messages.css';

function Messages({ onBack }) {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'stats'
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [productSizes, setProductSizes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllData = useCallback(async () => {
        setLoading(true);

        const [ordersRes, productsRes, sizesRes] = await Promise.all([
            supabase.from('messages').select('*').order('created_at', { ascending: false }),
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('product_sizes').select('*').order('created_at', { ascending: true }),
        ]);

        if (!ordersRes.error) setOrders(ordersRes.data || []);
        if (!productsRes.error) setProducts(productsRes.data || []);
        if (!sizesRes.error) setProductSizes(sizesRes.data || []);

        // Mark unread orders as read
        await supabase.from('messages').update({ is_read: true }).eq('is_read', false);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const toggleChecked = async (order) => {
        const nextVal = !order.is_checked;
        await supabase.from('messages').update({ is_checked: nextVal }).eq('id', order.id);
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, is_checked: nextVal } : o));
    };

    const deleteOrder = async (id) => {
        await supabase.from('messages').delete().eq('id', id);
        setOrders(prev => prev.filter(o => o.id !== id));
    };

    // Build per-product size statistics synced with ShopPage2's product_sizes
    const getStatsForProduct = (product) => {
        // Sizes added in ShopPage2 for this specific product
        const configuredSizes = productSizes.filter(s => s.product_id === product.id);

        // Orders matching this product
        const prodOrders = orders.filter(
            o => (o.product_name || '').trim().toLowerCase() === (product.name || '').trim().toLowerCase()
        );

        const sizeCounts = configuredSizes.map(sizeRow => {
            const matchingOrders = prodOrders.filter(
                o => (o.size || '').trim().toLowerCase() === (sizeRow.size || '').trim().toLowerCase()
            );
            const totalUnits = matchingOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
            return {
                id: sizeRow.id,
                size: sizeRow.size,
                available: sizeRow.available,
                orderCount: matchingOrders.length,
                unitCount: totalUnits
            };
        });

        const totalProductUnits = sizeCounts.reduce((sum, s) => sum + s.unitCount, 0);
        const topSize = sizeCounts.reduce(
            (best, curr) => (curr.unitCount > (best?.unitCount || 0) ? curr : best),
            null
        );

        return {
            sizeCounts,
            totalProductUnits,
            topSize: topSize && topSize.unitCount > 0 ? topSize : null
        };
    };

    return (
        <div id="msg-page">
            <div className="msg-header">
                <button className="msg-back-btn" onClick={onBack}>
                    ← BACK TO STORE
                </button>
                <h1 className="msg-title">ADMIN DASHBOARD</h1>
            </div>

            <div className="msg-tabs">
                <button
                    className={`msg-tab${activeTab === 'orders' ? ' active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    ORDERS ({orders.length})
                </button>
                <button
                    className={`msg-tab${activeTab === 'stats' ? ' active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    SIZE STATISTICS ({products.length})
                </button>
            </div>

            {loading ? (
                <div className="msg-loading">Loading dashboard data...</div>
            ) : activeTab === 'orders' ? (
                /* ================= ORDERS LIST ================= */
                <div className="msg-orders-list">
                    {orders.length === 0 ? (
                        <div className="msg-empty">No orders yet.</div>
                    ) : (
                        orders.map(order => (
                            <div
                                key={order.id}
                                className={`msg-order-card${order.is_checked ? ' checked' : ''}`}
                            >
                                <div className="msg-order-top">
                                    <div>
                                        <span className="msg-order-product">{order.product_name}</span>
                                        <span className="msg-order-badge">Size: {order.size || 'N/A'}</span>
                                        <span className="msg-order-badge">Qty: {order.quantity || 1}</span>
                                    </div>
                                    <div className="msg-order-total">
                                        {order.total_price} DZD
                                    </div>
                                </div>

                                <div className="msg-order-details">
                                    <p><strong>Customer:</strong> {order.fullname}</p>
                                    <p><strong>Phone:</strong> <a href={`tel:${order.phone}`}>{order.phone}</a></p>
                                    <p><strong>Wilaya:</strong> {order.wilaya} — {order.city}</p>
                                    <p><strong>Address:</strong> {order.address}</p>
                                    <p><strong>Email:</strong> {order.email}</p>
                                    <p className="msg-order-date">{order.ordered_at}</p>
                                </div>

                                <div className="msg-order-actions">
                                    <button
                                        className={`msg-action-btn${order.is_checked ? ' done' : ''}`}
                                        onClick={() => toggleChecked(order)}
                                    >
                                        {order.is_checked ? '✓ Confirmed' : 'Mark as Confirmed'}
                                    </button>
                                    <button
                                        className="msg-action-btn delete"
                                        onClick={() => deleteOrder(order.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* ================= PRODUCT SIZE STATISTICS ================= */
                <div className="msg-stats-grid">
                    {products.map(product => {
                        const { sizeCounts, totalProductUnits, topSize } = getStatsForProduct(product);

                        return (
                            <div key={product.id} className="msg-stat-card">
                                <div className="msg-stat-product-head">
                                    <img src={product.image_url} alt={product.name} />
                                    <div className="msg-stat-product-meta">
                                        <h3>{product.name}</h3>
                                        <p>Total Sold: <strong>{totalProductUnits} units</strong></p>
                                        {topSize ? (
                                            <span className="msg-top-size-pill">
                                                ★ MOST ORDERED: SIZE {topSize.size} ({topSize.unitCount} sold)
                                            </span>
                                        ) : (
                                            <span className="msg-no-sales-pill">No orders yet</span>
                                        )}
                                    </div>
                                </div>

                                <div className="msg-size-breakdown">
                                    {sizeCounts.length === 0 ? (
                                        <p className="msg-no-sizes">
                                            No sizes added for this product on ShopPage2 yet.
                                        </p>
                                    ) : (
                                        sizeCounts.map(s => {
                                            const percent = totalProductUnits > 0
                                                ? Math.round((s.unitCount / totalProductUnits) * 100)
                                                : 0;
                                            const isBest = topSize && topSize.id === s.id;

                                            return (
                                                <div key={s.id} className={`msg-size-row${isBest ? ' best' : ''}`}>
                                                    <div className="msg-size-row-top">
                                                        <span className="msg-size-name">
                                                            Size <strong>{s.size}</strong>
                                                            {!s.available && <em> (Out of Stock)</em>}
                                                        </span>
                                                        <span className="msg-size-numbers">
                                                            <strong>{s.unitCount}</strong> units ({s.orderCount} orders) — {percent}%
                                                        </span>
                                                    </div>
                                                    <div className="msg-size-bar-bg">
                                                        <div
                                                            className="msg-size-bar-fill"
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Messages;