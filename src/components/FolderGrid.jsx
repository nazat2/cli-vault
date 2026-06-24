import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import FolderCard from "./FolderCard.jsx";

export default function FolderGrid({ folders, onOpen }) {
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current && gridRef.current.children.length) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.6)", stagger: 0.045 }
      );
    }
  }, [folders]);

  if (folders.length === 0) {
    return (
      <div className="empty-state show">
        <div className="empty-box">
          <span className="empty-icon">[ ]</span>
          <p>
            BELUM ADA FOLDER.
            <br />
            KLIK "+ TAMBAH" UNTUK MULAI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="grid" ref={gridRef}>
      {folders.map((f) => (
        <FolderCard key={f.id} folder={f} onOpen={onOpen} />
      ))}
    </section>
  );
}
