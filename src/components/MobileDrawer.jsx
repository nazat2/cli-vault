import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ModeSwitch from "./ModeSwitch.jsx";
import { useInstallPrompt } from "../hooks/useInstallPrompt.js";

const FILTERS = [
  { key: "all", label: "SEMUA" },
  { key: "cli", label: "CLI" },
  { key: "image", label: "FOTO" },
];

export default function MobileDrawer({
  open,
  onClose,
  mode,
  onModeChange,
  filter,
  onFilter,
  onAdd,
  showToast,
}) {
  const panelRef = useRef(null);
  const { canInstall, installed, promptInstall } = useInstallPrompt();

  useEffect(() => {
    if (open && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.32, ease: "power3.out" }
      );
    }
  }, [open]);

  if (!open) return null;

  async function handleInstall() {
    const result = await promptInstall();
    if (result === "accepted") {
      showToast("APP SEDANG DIINSTALL...");
    } else if (result === "unsupported") {
      showToast("BROWSER INI BELUM SUPPORT INSTALL LANGSUNG");
    }
  }

  return (
    <div
      className="drawer-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="drawer-panel" ref={panelRef}>
        <div className="drawer-head">
          <span>PENGATURAN</span>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drawer-body">
          <button
            className="btn btn-add drawer-add"
            onClick={() => {
              onClose();
              onAdd();
            }}
          >
            + TAMBAH FOLDER
          </button>

          <p className="drawer-label">MODE PENYIMPANAN</p>
          <ModeSwitch mode={mode} onChange={onModeChange} />
          <p className="drawer-hint">
            {mode === "local"
              ? "Data tersimpan cuma di browser ini — cocok buat coba-coba dulu sebelum setup Supabase."
              : "Data tersimpan di Supabase — sinkron otomatis di semua device."}
          </p>

          <p className="drawer-label">FILTER FOLDER</p>
          <div className="filter-group drawer-filter">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`chip ${filter === f.key ? "active" : ""}`}
                onClick={() => onFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="drawer-label">APLIKASI</p>
          <div className="install-box">
            {installed ? (
              <p className="install-status">✓ APP SUDAH TERINSTALL DI PERANGKAT INI</p>
            ) : canInstall ? (
              <>
                <button className="btn btn-install" onClick={handleInstall}>
                  📲 DOWNLOAD / INSTALL APP
                </button>
                <p className="drawer-hint">
                  Sekali klik, CLI VAULT bakal muncul sebagai app tersendiri di HP/laptop kamu —
                  bisa dibuka dari home screen tanpa browser.
                </p>
              </>
            ) : (
              <p className="drawer-hint">
                Browser ini belum kasih opsi install otomatis. Di Chrome/Edge Android: ketuk menu
                (⋮) → <strong>"Tambahkan ke layar Utama"</strong> / <strong>"Install app"</strong>.
                Di Safari iOS: ketuk tombol Share → <strong>"Add to Home Screen"</strong>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
