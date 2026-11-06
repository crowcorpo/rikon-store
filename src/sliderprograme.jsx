import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './superbase.ts';
import { useAuth } from './authcontext.jsx';

function Slider() {
    const { isAdmin } = useAuth();

    const [slides, setslides] = useState([]);
    const [current, setcurrent] = useState(0);
    const [loading, setloading] = useState(true);

    const [showDeleteConfirm, setshowDeleteConfirm] = useState(false);
    const [showEditModal, setshowEditModal] = useState(false);
    const [editFile, seteditFile] = useState(null);
    const [targetName, settargetName] = useState(null);

    const touchstartX = useRef(null);

    const getslides = async () => {
        setloading(true);
        const { data, error } = await supabase.storage
            .from("admin-images")
            .list("admin/assets/slider", { limit: 100, offset: 0 });

        if (error) {
            console.error(error);
            setloading(false);
            return;
        }

        const imgs = data
            .filter(item => item.name !== '.emptyFolderPlaceholder')
            .map((item) => {
                const { data: pub } = supabase.storage
                    .from("admin-images")
                    .getPublicUrl(`admin/assets/slider/${item.name}`);
                return { name: item.name, url: pub.publicUrl };
            });

        setslides(imgs);
        setcurrent(0);
        setloading(false);
    };

    useEffect(() => {
        getslides();
    }, []);

    useEffect(() => {
        if (slides.length < 2) return;
        const timer = setInterval(() => {
            setcurrent(prev => (prev + 1) % slides.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [slides]);

    const prev = useCallback(() => {
        setcurrent(p => (p - 1 + slides.length) % slides.length);
    }, [slides.length]);

    const next = useCallback(() => {
        setcurrent(p => (p + 1) % slides.length);
    }, [slides.length]);

    const onTouchStart = (e) => {
        touchstartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
        if (touchstartX.current === null) return;
        const diff = touchstartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            diff > 0 ? next() : prev();
        }
        touchstartX.current = null;
    };

    const upload = async (file) => {
        if (!file) return;
        const uniquename = `${Date.now()}_${file.name}`;
        const filepath = `admin/assets/slider/${uniquename}`;
        const { error } = await supabase.storage
            .from("admin-images")
            .upload(filepath, file);
        if (error) {
            console.error(error);
            return;
        }
        await getslides();
    };

    const remove = async (name) => {
        const { error } = await supabase.storage
            .from("admin-images")
            .remove([`admin/assets/slider/${name}`]);
        if (error) {
            console.error(error);
            return;
        }
        await getslides();
    };

    const editslide = async (oldname, newfile) => {
        if (!newfile) return;
        const { error: delerror } = await supabase.storage
            .from("admin-images")
            .remove([`admin/assets/slider/${oldname}`]);
        if (delerror) {
            console.error(delerror);
            return;
        }
        const uniquename = `${Date.now()}_${newfile.name}`;
        const newpath = `admin/assets/slider/${uniquename}`;
        const { error: uploaderror } = await supabase.storage
            .from("admin-images")
            .upload(newpath, newfile);
        if (uploaderror) {
            console.error(uploaderror);
            return;
        }
        await getslides();
    };

    const scrollDownToProducts = () => {
        document.getElementById("img7awifather")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            <div id="sl-section">
                <div
                    id="slbox"
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    {loading && (
                        <div id="slloader">
                            <div id="slspinner" />
                        </div>
                    )}

                    {!loading && slides.length === 0 && (
                        <div id="slempty">
                            <p>NO SLIDES YET</p>
                            {isAdmin && <span>Upload your first banner below</span>}
                        </div>
                    )}

                    {!loading && slides.length > 0 && (
                        <>
                            {slides.map((slide, i) => (
                                <div
                                    className="slslide"
                                    key={slide.name}
                                    style={{
                                        opacity: i === current ? 1 : 0,
                                        zIndex: i === current ? 2 : 1,
                                        pointerEvents: i === current ? "auto" : "none"
                                    }}
                                >
                                    <img src={slide.url} alt="" />
                                </div>
                            ))}

                            {slides.length > 1 && (
                                <div id="sldots">
                                    {slides.map((_, i) => (
                                        <button
                                            key={i}
                                            className={`sldot${i === current ? " slactive" : ""}`}
                                            onClick={() => setcurrent(i)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {isAdmin && (
                        <div id="sladminbar">
                            <input
                                id="slup-input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => upload(e.target.files[0])}
                            />
                            <button id="slupbtn" onClick={() => document.getElementById("slup-input").click()}>
                                + Upload Slide
                            </button>

                            {slides.length > 0 && (
                                <>
                                    <button
                                        id="sleditbtn"
                                        onClick={() => {
                                            settargetName(slides[current].name);
                                            setshowEditModal(true);
                                            document.body.style.overflow = "hidden";
                                        }}
                                    >
                                        Replace
                                    </button>

                                    <button
                                        id="sldelbtn"
                                        onClick={() => {
                                            settargetName(slides[current].name);
                                            setshowDeleteConfirm(true);
                                            document.body.style.overflow = "hidden";
                                        }}
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* YOUNGLA FLOATING WHITE SCROLL-DOWN CIRCLE BUTTON */}
                <button
                    id="sl-scroll-down"
                    onClick={scrollDownToProducts}
                    aria-label="Scroll to products"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
            </div>

            {/* DELETE MODAL */}
            {showDeleteConfirm && (
                <div id="slmodalbg">
                    <div id="slmodal">
                        <h2 id="slmodaltext">DELETE SLIDE?</h2>
                        <p id="slmodalsub">This action cannot be undone.</p>
                        <div id="slmodalbtns">
                            <button
                                id="slcancel"
                                onClick={() => {
                                    setshowDeleteConfirm(false);
                                    settargetName(null);
                                    document.body.style.overflow = "auto";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                id="slconfirm"
                                onClick={async () => {
                                    await remove(targetName);
                                    setshowDeleteConfirm(false);
                                    settargetName(null);
                                    document.body.style.overflow = "auto";
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div id="slmodalbg">
                    <div id="slmodal">
                        <h2 id="slmodaltext">REPLACE SLIDE</h2>
                        <p id="slmodalsub">Choose a new banner image</p>
                        <input
                            id="sledit-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => seteditFile(e.target.files[0])}
                        />
                        <button id="slchoose" onClick={() => document.getElementById("sledit-input").click()}>
                            {editFile ? editFile.name : "Choose Image File"}
                        </button>
                        <div id="slmodalbtns">
                            <button
                                id="slcancel"
                                onClick={() => {
                                    setshowEditModal(false);
                                    settargetName(null);
                                    seteditFile(null);
                                    document.body.style.overflow = "auto";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                id="slconfirm"
                                onClick={async () => {
                                    await editslide(targetName, editFile);
                                    setshowEditModal(false);
                                    settargetName(null);
                                    seteditFile(null);
                                    document.body.style.overflow = "auto";
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Slider;