import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { getBackend } from "../lib/backends.js";

export default function ViewModal({ folder, onClose, onDeleted, showToast, onImageClick, mode, onEdit }) {
  const boxRef = useRef(null);
  const [copyLabel, setCopyLabel] = useState("COPY");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (folder && boxRef.current) {
      gsap.fromTo(
        boxRef.current,
        { y: 30, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" }
      );
      setCopyLabel("COPY");
    }
  }, [folder]);

  if (!folder) return null;

  async function handleCopy() {
    if (!folder.code) return;
    try {
      await navigator.clipboard.writeText(folder.code);
      setCopyLabel("COPIED ✓");
      showToast("KODE DISALIN!");
      setTimeout(() => setCopyLabel("COPY"), 1400);
    } catch {
      showToast("GAGAL MENYALIN");
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus folder ini? Tidak bisa dibatalkan.")) return;
    setDeleting(true);
    try {
      const backend = getBackend(mode);
      await backend.deleteFolder(folder);
      showToast("FOLDER DIHAPUS");
      onDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("GAGAL MENGHAPUS");
    } finally {
      setDeleting(false);
    }
  }

  const hasCode = Boolean(folder.code);
  const hasImages = folder.images && folder.images.length > 0;

  return (
    <div className="modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box view-box" ref={boxRef}>
        <div className="modal-head modal-head-stack">
          <div className="modal-head-top">
            <h2>{folder.name}</h2>
            <button className="btn-close" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="modal-head-actions">
            <div className="modal-head-badges">
              <span className="category-badge">{folder.category || "Umum"}</span>
              <span className={`mode-pill ${mode === "cloud" ? "is-cloud" : "is-local"}`}>
                {mode === "cloud" ? "☁ CLOUD" : "💾 LOCAL"}
              </span>
            </div>
            <div className="modal-head-buttons">
              <button className="btn-icon" title="Edit folder" onClick={() => onEdit(folder)}>
                ✏️
              </button>
              <button className="btn-icon" title="Hapus folder" onClick={handleDelete} disabled={deleting}>
                🗑
              </button>
            </div>
          </div>
        </div>
        <div className="modal-body">
          {hasCode && (
            <div className="view-section">
              <div className="code-head">
                <span>KODE CLI</span>
                <button className="btn-copy" onClick={handleCopy}>
                  {copyLabel}
                </button>
              </div>
              <pre className="code-block">{folder.code}</pre>
            </div>
          )}

          {hasImages && (
            <div className="view-section">
              <div className="code-head">
                <span>FOTO</span>
              </div>
              <div className="view-img-grid">
                {folder.images.map((img, i) => (
                  <img key={i} src={img.url} alt={`foto-${i}`} onClick={() => onImageClick(img.url)} />
                ))}
              </div>
            </div>
          )}

          {!hasCode && !hasImages && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#777" }}>
              Folder ini kosong.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
