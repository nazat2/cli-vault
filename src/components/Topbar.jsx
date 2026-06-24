export default function Topbar({ count, mode, onAdd, onMenu }) {
  return (
    <header className="topbar">
      <div className="brand">
        <img src="/icons/logo-64.png" alt="CLI VAULT" className="brand-logo" />
        <span className="brand-text">
          CLI<b>VAULT</b>
        </span>
      </div>

      <div className="topbar-actions">
        <span className="count-chip">{count} ITEM</span>
        <span className={`mode-pill ${mode === "cloud" ? "is-cloud" : "is-local"}`}>
          {mode === "cloud" ? "☁ CLOUD" : "💾 LOCAL"}
        </span>

        <button className="btn btn-add desktop-only" onClick={onAdd}>
          + TAMBAH
        </button>

        <button className="hamburger-btn" onClick={onMenu} aria-label="Buka menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
