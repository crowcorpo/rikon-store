import React from "react";
import "./footer.css";

// Put your exact links here:
const SOCIAL_LINKS = [
    {
        platform: "instagram",
        label: "Instagram 1",
        url: "https://www.instagram.com/reda_rikon?xtok=MWZ6MW42czB0NnFv"
    },
    {
        platform: "instagram",
        label: "Instagram 2",
        url: "https://www.instagram.com/rikon_store?mdxt=MXcxYzdxbDQ1dnBwYg=="
    },
    {
        platform: "facebook",
        label: "Facebook 1",
        url: "https://www.facebook.com/share/1FER2bgU7h/"
    },
    {
        platform: "facebook",
        label: "Facebook 2",
        url: "https://www.facebook.com/"
    },
    {
        platform: "tiktok",
        label: "TikTok 1",
        url: "https://www.tiktok.com/@reda.rikon?_r=1&_t=ZS-9B8JA6cgonB"
    },
    {
        platform: "tiktok",
        label: "TikTok 2",
        url: "https://www.tiktok.com/"
    },
    {
        platform: "blueprint",
        label: "AI Blueprint Website",
        url: "https://reda-rikon-five.vercel.app/"
    }
];

function RenderIcon({ platform }) {
    if (platform === "instagram") {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
        );
    }

    if (platform === "facebook") {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
        );
    }

    if (platform === "tiktok") {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
        );
    }

    // AI Blueprint Website icon
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

function Footer({ id = "footer" }) {
    return (
        <footer id={id} className="yla-footer">
            <div className="yla-footer__inner">
                {/* BRAND TITLE */}
                <div className="yla-footer__brand">
                    <h2 className="yla-footer__logo">RIKON STORE</h2>
                </div>

                {/* SOCIAL & WEBSITE LINKS */}
                <div className="yla-footer__links">
                    {SOCIAL_LINKS.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`yla-footer__link${item.platform === "blueprint" ? " yla-footer__link--highlight" : ""}`}
                        >
                            <RenderIcon platform={item.platform} />
                            <span>{item.label}</span>
                        </a>
                    ))}
                </div>

                {/* BOTTOM COPYRIGHT */}
                <div className="yla-footer__bottom">
                    <p>© {new Date().getFullYear()} RIKON STORE. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;