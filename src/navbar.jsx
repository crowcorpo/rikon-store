import { useState, useEffect, useCallback } from "react";
import { supabase } from "./superbase.ts";
import { useAuth } from "./authcontext.jsx";

function Navbar({ hideLinks, onOpenMessages, onGoHome }) {
    const { user, isAdmin, signIn, signOut } = useAuth();

    const [show, setShow] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnread = useCallback(async () => {
        if (!isAdmin) return;
        const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("is_read", false);
        setUnreadCount(count || 0);
    }, [isAdmin]);

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, [fetchUnread]);

    useEffect(() => {
        if (!isAdmin) return;
        const channel = supabase
            .channel("messages-inserts")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                () => {
                    setUnreadCount((prev) => prev + 1);
                }
            )
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [isAdmin]);

    useEffect(() => {
        document.body.style.overflow = show ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [show]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToSection = (id) => {
        setShow(false);
        if (hideLinks && onGoHome) {
            onGoHome();
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 150);
            return;
        }
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleUpload = () => {
        setShow(false);
        if (hideLinks && onGoHome) {
            onGoHome();
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent("gallery-upload-open"));
            }, 150);
            return;
        }
        window.dispatchEvent(new CustomEvent("gallery-upload-open"));
    };

    const handleOpenMessages = () => {
        setUnreadCount(0);
        setShow(false);
        if (onOpenMessages) onOpenMessages();
    };

    const links = [
        { label: "Home", id: "hero" },
        { label: "Products", id: "img7awifather" },
        { label: "About Us", id: "footer" },
    ];

    return (
        <>
            <header className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
                <div className="navbar__inner">
                    {/* LEFT: HAMBURGER MENU */}
                    <div className="navbar__left">
                        <button
                            type="button"
                            className={`navbar__hamburger${show ? " open" : ""}`}
                            onClick={() => setShow((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </div>

                    {/* CENTER: RIKON STORE */}
                    <div className="navbar__center-logo" onClick={() => { setShow(false); if (onGoHome) onGoHome(); }}>
                        RIKON STORE
                    </div>

                    {/* RIGHT: MESSAGES ICON */}
                    <div className="navbar__right">
                        {!hideLinks && isAdmin && (
                            <button type="button" id="nav-upload-btn" className="desktop-only-btn" onClick={handleUpload}>
                                + Upload
                            </button>
                        )}

                        {isAdmin && (
                            <button type="button" id="nav-messages-btn" onClick={handleOpenMessages} aria-label="Orders">
                                <span id="nav-messages-icon-wrap">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span id="nav-messages-badge">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* DARK BACKDROP BEHIND DRAWER */}
            {show && <div className="navbar__backdrop" onClick={() => setShow(false)} />}

            {/* SLIDE-OUT DRAWER (ABOVE BACKDROP) */}
            <nav className={`navbar__mobile${show ? " navbar__mobile--open" : ""}`}>
                <ul>
                    {links.map((l) => (
                        <li key={l.id} onClick={() => scrollToSection(l.id)}>
                            {l.label}
                        </li>
                    ))}

                    {isAdmin && (
                        <>
                            <li onClick={handleOpenMessages}>
                                Orders & Size Stats {unreadCount > 0 ? `(${unreadCount})` : ""}
                            </li>
                            <li onClick={handleUpload}>
                                + Upload Product
                            </li>
                        </>
                    )}

                    {/* INVISIBLE BUT CLICKABLE SIGN IN / SIGN OUT BUTTON */}
                    <li
                        className="secret-auth-btn"
                        onClick={() => {
                            setShow(false);
                            user ? signOut() : signIn();
                        }}
                    >
                        {user ? "Sign Out" : "Sign In"}
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default Navbar;