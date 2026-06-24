import { useMemo, useState } from "react";
import Topbar from "./components/Topbar.jsx";
import Hero from "./components/Hero.jsx";
import Toolbar from "./components/Toolbar.jsx";
import FolderGrid from "./components/FolderGrid.jsx";
import AddModal from "./components/AddModal.jsx";
import ViewModal from "./components/ViewModal.jsx";
import Lightbox from "./components/Lightbox.jsx";
import Toast from "./components/Toast.jsx";
import SetupBanner from "./components/SetupBanner.jsx";
import MobileDrawer from "./components/MobileDrawer.jsx";
import Fab from "./components/Fab.jsx";
import InstallPrompt from "./components/InstallPrompt.jsx";
import { useFolders } from "./hooks/useFolders.js";
import { useToast } from "./hooks/useToast.js";
import { useMode } from "./hooks/useMode.js";
import { supabaseReady } from "./lib/supabase.js";

export default function App() {
  const [mode, switchMode] = useMode();
  const { folders, loading, error } = useFolders(mode);
  const { message, visible, showToast } = useToast();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editFolder, setEditFolder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const filtered = useMemo(() => {
    return folders.filter((f) => {
      if (filter === "cli" && !f.code) return false;
      if (filter === "image" && !(f.images && f.images.length)) return false;
      if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [folders, search, filter]);

  function handleModeChange(nextMode) {
    if (nextMode === mode) return;
    switchMode(nextMode);
    showToast(nextMode === "cloud" ? "MODE: CLOUD (SUPABASE)" : "MODE: LOCAL (BROWSER)");
  }

  return (
    <>
      <div className="noise" />
      <Topbar
        count={folders.length}
        mode={mode}
        onAdd={() => {
          setEditFolder(null);
          setAddOpen(true);
        }}
        onMenu={() => setDrawerOpen(true)}
      />

      <main className="wrap">
        <Hero />

        {mode === "cloud" && !supabaseReady && <SetupBanner />}
        {mode === "cloud" && supabaseReady && error && error !== "not-configured" && (
          <div className="setup-banner">
            <span className="setup-icon">✕</span>
            <div>
              <p className="setup-title">GAGAL TERHUBUNG KE SUPABASE</p>
              <p className="setup-text">{error}</p>
            </div>
          </div>
        )}

        <Toolbar
          search={search}
          onSearch={setSearch}
          filter={filter}
          onFilter={setFilter}
          mode={mode}
          onModeChange={handleModeChange}
        />

        {loading ? (
          <p className="loading-text">MEMUAT DATA...</p>
        ) : (
          <FolderGrid folders={filtered} onOpen={setActiveFolder} />
        )}
      </main>

      <footer className="footer">
        <p>
          {mode === "cloud"
            ? "DATA TERSIMPAN DI SUPABASE — SINKRON DI SEMUA PERANGKAT"
            : "MODE LOCAL — DATA HANYA TERSIMPAN DI BROWSER INI"}
        </p>
      </footer>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={mode}
        onModeChange={handleModeChange}
        filter={filter}
        onFilter={setFilter}
        onAdd={() => {
          setEditFolder(null);
          setAddOpen(true);
        }}
        showToast={showToast}
      />

      <AddModal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditFolder(null);
        }}
        onSaved={() => {}}
        showToast={showToast}
        mode={mode}
        editFolder={editFolder}
      />

      <ViewModal
        folder={activeFolder}
        onClose={() => setActiveFolder(null)}
        onDeleted={() => setActiveFolder(null)}
        showToast={showToast}
        onImageClick={setLightboxSrc}
        mode={mode}
        onEdit={(folder) => {
          setEditFolder(folder);
          setActiveFolder(null);
          setAddOpen(true);
        }}
      />

      <Fab
        onClick={() => {
          setEditFolder(null);
          setAddOpen(true);
        }}
      />

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      <Toast message={message} visible={visible} />

      <InstallPrompt showToast={showToast} />
    </>
  );
}
