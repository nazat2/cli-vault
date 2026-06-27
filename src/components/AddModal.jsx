import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { getBackend } from "../lib/backends.js";
import { supabaseReady } from "../lib/supabase.js";
import { addWatermark } from "../lib/watermark.js";

const DEFAULT_CATEGORY_SUGGESTIONS = ["Umum", "VLAN", "Routing", "Switching", "ACL", "NAT", "Troubleshooting"];

export default function AddModal({ open, onClose, onSaved, showToast, mode, editFolder, categories }) {
  const boxRef = useRef(null);
  const nameRef = useRef(null);
  const fileInputRef = useRef(null);

  const isEdit = Boolean(editFolder);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [existingImages, setExistingImages] = useState([]); // { url, path } yang sudah tersimpan
  const [removedImages, setRemovedImages] = useState([]); // yang dihapus user saat edit
  const [newFiles, setNewFiles] = useState([]); // { file, previewUrl } yang baru ditambah (sudah ada watermark)
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [nameError, setNameError] = useState(false);

  const categoryOptions = [...new Set([...DEFAULT_CATEGORY_SUGGESTIONS, ...(categories || [])])];

  useEffect(() => {
    if (open) {
      setName(editFolder?.name || "");
      setCode(editFolder?.code || "");
      setCategory(editFolder?.category || "");
      setExistingImages(editFolder?.images ? [...editFolder.images] : []);
      setRemovedImages([]);
      setNewFiles([]);
      setSaving(false);
      setProcessingFiles(false);
      if (boxRef.current) {
        gsap.fromTo(
          boxRef.current,
          { y: 30, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" }
        );
      }
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open, editFolder]);

  if (!open) return null;

  async function handleFiles(fileList) {
    const picked = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!picked.length) return;

    setProcessingFiles(true);
    try {
      const results = [];
      for (const file of picked) {
        const watermarked = await addWatermark(file);
        results.push({ file: watermarked, previewUrl: URL.createObjectURL(watermarked) });
      }
      setNewFiles((prev) => [...prev, ...results]);
    } catch (err) {
      console.error(err);
      showToast("GAGAL MEMBUBUHKAN WATERMARK, FOTO DILEWATI");
    } finally {
      setProcessingFiles(false);
    }
  }

  function removeNewFile(idx) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeExistingImage(idx) {
    setExistingImages((prev) => {
      const target = prev[idx];
      if (target) setRemovedImages((r) => [...r, target]);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      nameRef.current?.focus();
      setTimeout(() => setNameError(false), 900);
      showToast("NAMA FOLDER WAJIB DIISI");
      return;
    }

    if (mode === "cloud" && !supabaseReady) {
      showToast("SUPABASE BELUM DIKONFIGURASI — pakai mode LOCAL dulu");
      return;
    }

    setSaving(true);
    try {
      const backend = getBackend(mode);
      const finalCategory = category.trim() || "Umum";

      if (isEdit) {
        await backend.updateFolder(editFolder.id, {
          name: trimmed,
          code: code.trim(),
          category: finalCategory,
          newFiles: newFiles.map((f) => f.file),
          keepImages: existingImages,
          removedPaths: removedImages.map((img) => img.path).filter(Boolean),
        });
        showToast("PERUBAHAN DISIMPAN");
      } else {
        await backend.createFolder({
          name: trimmed,
          code: code.trim(),
          category: finalCategory,
          files: newFiles.map((f) => f.file),
        });
        showToast("FOLDER DISIMPAN");
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("GAGAL MENYIMPAN — CEK KONEKSI / KONFIGURASI");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" ref={boxRef}>
        <div className="modal-head">
          <h2>{isEdit ? "EDIT FOLDER" : "FOLDER BARU"}</h2>
          <div className="view-actions">
            <span className={`mode-pill ${mode === "cloud" ? "is-cloud" : "is-local"}`}>
              {mode === "cloud" ? "☁ CLOUD" : "💾 LOCAL"}
            </span>
            <button className="btn-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body">
          <label className="field-label">NAMA FOLDER</label>
          <input
            ref={nameRef}
            type="text"
            className="input"
            placeholder="cth: Konfigurasi Router R1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={nameError ? { outline: "3px solid var(--pink)" } : undefined}
          />

          <label className="field-label">KATEGORI</label>
          <input
            type="text"
            className="input"
            placeholder="cth: VLAN, Routing, Switching... (bebas, bisa bikin baru)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="category-suggestions"
          />
          <datalist id="category-suggestions">
            {categoryOptions.map((c) => (
              <option value={c} key={c} />
            ))}
          </datalist>
          <p className="field-hint">
            Kosongkan kalau gak mau dikategorikan (otomatis masuk "Umum"). Bebas bikin kategori baru, gak ada batasan jumlah folder per kategori.
          </p>

          <label className="field-label">KODE CLI</label>
          <textarea
            className="textarea"
            placeholder={"enable\nconfigure terminal\nhostname R1\n..."}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <label className="field-label">FOTO (Packet Tracer)</label>
          <p className="field-hint">Setiap foto otomatis dibubuhi watermark "nazat".</p>

          {existingImages.length > 0 && (
            <>
              {isEdit && <p className="sub-label">FOTO TERSIMPAN</p>}
              <div className="preview-strip">
                {existingImages.map((img, i) => (
                  <div className="preview-thumb" key={`existing-${i}`}>
                    <img src={img.url} alt="foto tersimpan" />
                    <button className="preview-remove" onClick={() => removeExistingImage(i)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div
            className={`dropzone ${dragging ? "drag" : ""} ${processingFiles ? "is-processing" : ""}`}
            onClick={() => !processingFiles && fileInputRef.current?.click()}
            onDragEnter={(e) => { e.preventDefault(); if (!processingFiles) setDragging(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!processingFiles && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={processingFiles}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="dropzone-inner">
              {processingFiles ? (
                <>
                  <span className="dz-icon dz-spin">⟳</span>
                  <p>MEMBUBUHKAN WATERMARK...</p>
                </>
              ) : (
                <>
                  <span className="dz-icon">⇪</span>
                  <p>
                    SERET FOTO KE SINI ATAU <span className="dz-link">PILIH FILE</span>
                  </p>
                </>
              )}
            </div>
          </div>

          {newFiles.length > 0 && (
            <>
              {isEdit && <p className="sub-label">FOTO BARU</p>}
              <div className="preview-strip">
                {newFiles.map((f, i) => (
                  <div className="preview-thumb" key={`new-${i}`}>
                    <img src={f.previewUrl} alt="preview baru" />
                    <button className="preview-remove" onClick={() => removeNewFile(i)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <button className="btn btn-save" onClick={handleSave} disabled={saving || processingFiles}>
            {saving ? "MENYIMPAN..." : isEdit ? "SIMPAN PERUBAHAN" : "SIMPAN FOLDER"}
          </button>
        </div>
      </div>
    </div>
  );
}
