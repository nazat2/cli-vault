import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import FolderCard from "./FolderCard.jsx";
import { categoryColor } from "../lib/categoryColor.js";

export default function FolderGrid({ folders, onOpen }) {
  const containerRef = useRef(null);

  const groups = useMemo(() => {
    const map = new Map();
    folders.forEach((f) => {
      const cat = (f.category || "Umum").trim() || "Umum";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(f);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [folders]);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".folder-card");
    if (cards.length) {
      gsap.fromTo(
        cards,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.6)", stagger: 0.04 }
      );
    }
    const headers = containerRef.current.querySelectorAll(".category-title");
    if (headers.length) {
      gsap.fromTo(
        headers,
        { x: -12, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.06 }
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
    <div ref={containerRef}>
      {groups.map(([category, items]) => {
        const color = categoryColor(category);
        return (
          <section className="category-section" key={category}>
            <h3 className="category-title" style={{ borderBottomColor: color.bg }}>
              <span className="category-dot" style={{ background: color.bg }} />
              <span className="category-title-text">{category}</span>
              <span className="category-count" style={{ background: color.bg, color: color.fg }}>
                {items.length}
              </span>
            </h3>
            <div className="grid">
              {items.map((f) => (
                <FolderCard key={f.id} folder={f} onOpen={onOpen} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
