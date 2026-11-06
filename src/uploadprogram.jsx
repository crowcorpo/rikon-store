import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './superbase.ts';
import { useAuth } from './authcontext.jsx';

const CATEGORIES = ['all', 'clothes', 'pants', 'sneakers', 'caps'];
const UPLOAD_CATEGORIES = ['clothes', 'pants', 'sneakers', 'caps'];

const EMPTY_UPLOAD = { file: null, name: '', price: '', cat: 'clothes' };
const EMPTY_EDIT = { id: null, oldImg: null, file: null, name: '', price: '', cat: 'clothes' };

function Test2({ onProductClick }) {
    const { isAdmin } = useAuth();

    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [showUpload, setShowUpload] = useState(false);
    const [uploadForm, setUploadForm] = useState(EMPTY_UPLOAD);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ id: null, img: null });
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState(EMPTY_EDIT);

    const hasFetched = useRef(false);

    const getProducts = useCallback(async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error(error);
            return;
        }
        setProducts(data || []);
    }, []);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        getProducts();
    }, [getProducts]);

    useEffect(() => {
        const open = () => {
            setShowUpload(true);
            document.body.style.overflow = 'hidden';
        };
        window.addEventListener('gallery-upload-open', open);
        return () => window.removeEventListener('gallery-upload-open', open);
    }, []);

    const confirmUpload = async () => {
        const { file, name, price, cat } = uploadForm;
        if (!file || !name || !price) return;

        const uniquename = `${Date.now()}_${file.name}`;
        const filepath = `admin/assets/gallery/${uniquename}`;

        const { error: uploaderror } = await supabase.storage
            .from('admin-images')
            .upload(filepath, file);
        if (uploaderror) {
            console.error(uploaderror);
            return;
        }

        const { data: pub } = supabase.storage
            .from('admin-images')
            .getPublicUrl(filepath);

        const { error: dberror } = await supabase
            .from('products')
            .insert({ name, price: parseFloat(price), image_url: pub.publicUrl, category: cat });
        if (dberror) {
            console.error(dberror);
            return;
        }

        setUploadForm(EMPTY_UPLOAD);
        setShowUpload(false);
        document.body.style.overflow = 'auto';
        await getProducts();
    };

    const closeUpload = () => {
        setUploadForm(EMPTY_UPLOAD);
        setShowUpload(false);
        document.body.style.overflow = 'auto';
    };

    const remove = async () => {
        const { id, img } = deleteTarget;
        const { error: dberror } = await supabase.from('products').delete().eq('id', id);
        if (dberror) {
            console.error(dberror);
            return;
        }

        const path = img.split('/admin-images/')[1];
        if (path) await supabase.storage.from('admin-images').remove([decodeURIComponent(path)]);

        setProducts(prev => prev.filter(p => p.id !== id));
        setDeleteTarget({ id: null, img: null });
        setShowConfirm(false);
        document.body.style.overflow = 'auto';
    };

    const openEdit = (product) => {
        setEditForm({
            id: product.id,
            oldImg: product.image_url,
            file: null,
            name: product.name,
            price: String(product.price),
            cat: product.category || 'clothes',
        });
        setShowEdit(true);
        document.body.style.overflow = 'hidden';
    };

    const closeEdit = () => {
        setEditForm(EMPTY_EDIT);
        setShowEdit(false);
        document.body.style.overflow = 'auto';
    };

    const confirmEdit = async () => {
        const { id, oldImg, file, name, price, cat } = editForm;
        let newImageUrl = null;

        if (file) {
            const oldpath = oldImg.split('/admin-images/')[1];
            if (oldpath) await supabase.storage.from('admin-images').remove([decodeURIComponent(oldpath)]);

            const uniquename = `${Date.now()}_${file.name}`;
            const filepath = `admin/assets/gallery/${uniquename}`;
            const { error: uploaderror } = await supabase.storage
                .from('admin-images')
                .upload(filepath, file);
            if (uploaderror) {
                console.error(uploaderror);
                return;
            }

            const { data: pub } = supabase.storage.from('admin-images').getPublicUrl(filepath);
            newImageUrl = pub.publicUrl;
        }

        const updates = {
            name,
            price: parseFloat(price),
            category: cat,
            ...(newImageUrl && { image_url: newImageUrl }),
        };

        const { error } = await supabase.from('products').update(updates).eq('id', id);
        if (error) {
            console.error(error);
            return;
        }

        setEditForm(EMPTY_EDIT);
        setShowEdit(false);
        document.body.style.overflow = 'auto';
        await getProducts();
    };

    const filteredProducts = activeTab === 'all'
        ? products
        : products.filter(p => (p.category || '').toLowerCase() === activeTab);

    return (
        <>
            <div id="img7awifather">
                {/* YOUNGLA STYLE UNDERLINED CATEGORY TABS */}
                <div className="yla-tabs">
                    {CATEGORIES.map(tab => (
                        <button
                            key={tab}
                            className={`yla-tab-btn${activeTab === tab ? ' active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div id="img7awi">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <div
                                className="product-img-wrap"
                                onClick={() => onProductClick(product.id)}
                            >
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    loading="lazy"
                                    decoding="async"
                                />

                                {isAdmin && (
                                    <div id="imgbtngroup">
                                        <button
                                            id="edit"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEdit(product);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            id="delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteTarget({ id: product.id, img: product.image_url });
                                                setShowConfirm(true);
                                                document.body.style.overflow = 'hidden';
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="product-info" onClick={() => onProductClick(product.id)}>
                                <span className="product-name">{product.name}</span>
                                <span className="product-price">{Number(product.price).toFixed(2)} DZD</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* UPLOAD MODAL */}
            {showUpload && (
                <div id="confather">
                    <div id="confirmidel" className="upload-modal">
                        <h1 id="text">ADD NEW PRODUCT</h1>

                        <div
                            className="upload-img-preview"
                            onClick={() => document.getElementById('real-file-input').click()}
                        >
                            {uploadForm.file ? (
                                <img src={URL.createObjectURL(uploadForm.file)} alt="preview" />
                            ) : (
                                <span>+ Click to choose product image</span>
                            )}
                        </div>
                        <input
                            id="real-file-input"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => setUploadForm(f => ({ ...f, file: e.target.files[0] }))}
                        />

                        <input
                            className="product-input"
                            type="text"
                            placeholder="Product Name"
                            value={uploadForm.name}
                            onChange={(e) => setUploadForm(f => ({ ...f, name: e.target.value }))}
                        />

                        <input
                            className="product-input"
                            type="number"
                            placeholder="Price in DZD (e.g. 4500)"
                            min="0"
                            step="1"
                            value={uploadForm.price}
                            onChange={(e) => setUploadForm(f => ({ ...f, price: e.target.value }))}
                        />

                        <div className="category-selector">
                            {UPLOAD_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`cat-btn${uploadForm.cat === cat ? ' cat-active' : ''}`}
                                    onClick={() => setUploadForm(f => ({ ...f, cat }))}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div id="slmodalbtns">
                            <button id="koko" onClick={closeUpload}>Cancel</button>
                            <button
                                id="koko"
                                className="confirm-btn"
                                onClick={confirmUpload}
                                disabled={!uploadForm.file || !uploadForm.name || !uploadForm.price}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {showConfirm && (
                <div id="confather">
                    <div id="confirmidel">
                        <h1 id="text">DELETE PRODUCT?</h1>
                        <p className="modal-sub">This action cannot be undone.</p>
                        <div id="slmodalbtns">
                            <button
                                id="koko"
                                onClick={() => {
                                    setShowConfirm(false);
                                    setDeleteTarget({ id: null, img: null });
                                    document.body.style.overflow = 'auto';
                                }}
                            >
                                Cancel
                            </button>
                            <button id="koko" className="danger-btn" onClick={remove}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEdit && (
                <div id="confather">
                    <div id="confirmidel" className="upload-modal">
                        <h1 id="text">EDIT PRODUCT</h1>

                        <div
                            className="upload-img-preview"
                            onClick={() => document.getElementById('edit-file-input').click()}
                        >
                            {editForm.file ? (
                                <img src={URL.createObjectURL(editForm.file)} alt="preview" />
                            ) : (
                                <img src={editForm.oldImg} alt="current" loading="lazy" />
                            )}
                        </div>
                        <input
                            id="edit-file-input"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => setEditForm(f => ({ ...f, file: e.target.files[0] }))}
                        />

                        <input
                            className="product-input"
                            type="text"
                            placeholder="Product Name"
                            value={editForm.name}
                            onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                        />

                        <input
                            className="product-input"
                            type="number"
                            placeholder="Price in DZD"
                            min="0"
                            step="1"
                            value={editForm.price}
                            onChange={(e) => setEditForm(f => ({ ...f, price: e.target.value }))}
                        />

                        <div className="category-selector">
                            {UPLOAD_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`cat-btn${editForm.cat === cat ? ' cat-active' : ''}`}
                                    onClick={() => setEditForm(f => ({ ...f, cat }))}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div id="slmodalbtns">
                            <button id="koko" onClick={closeEdit}>Cancel</button>
                            <button id="koko" className="confirm-btn" onClick={confirmEdit}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Test2;