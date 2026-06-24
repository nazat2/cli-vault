export default function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="lightbox show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <img src={src} alt="preview" />
      <button className="lightbox-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
