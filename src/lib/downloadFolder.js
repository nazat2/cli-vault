import JSZip from "jszip";

// Konversi data URL base64 jadi Uint8Array (untuk foto LOCAL mode)
function base64ToBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Ambil extension dari url/dataUrl/filename
function getExtension(urlOrName, fallback = "jpg") {
  if (urlOrName.startsWith("data:image/")) {
    const mime = urlOrName.split(";")[0].split("/")[1];
    return mime === "jpeg" ? "jpg" : mime || fallback;
  }
  const ext = urlOrName.split("?")[0].split(".").pop().toLowerCase();
  return ext && ext.length <= 5 ? ext : fallback;
}

// Sanitasi nama file: hapus karakter yang gak valid
function safeFileName(name) {
  return name
    .trim()
    .replace(/[/\\:*?"<>|]/g, "-")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

/**
 * Download satu folder jadi file ZIP.
 * Isi ZIP:
 *   - kode-cli.txt   → isi kode CLI (kalau ada)
 *   - foto/          → semua foto (kalau ada)
 *
 * @param {object} folder  — objek folder dari backend
 * @param {function} onProgress — callback opsional (0-100)
 */
export async function downloadFolderAsZip(folder, onProgress) {
  const zip = new JSZip();
  const zipName = safeFileName(folder.name || "folder");

  // --- 1. Kode CLI ---
  if (folder.code && folder.code.trim()) {
    zip.file("kode-cli.txt", folder.code);
  }

  // --- 2. Foto ---
  const images = folder.images || [];
  if (images.length > 0) {
    const photoFolder = zip.folder("foto");
    const total = images.length;

    for (let i = 0; i < total; i++) {
      const img = images[i];
      const url = img.url || "";
      const ext = getExtension(url);
      const fileName = `foto-${String(i + 1).padStart(2, "0")}.${ext}`;

      try {
        if (url.startsWith("data:")) {
          // LOCAL mode — base64 data URL, langsung decode
          photoFolder.file(fileName, base64ToBytes(url));
        } else {
          // CLOUD mode — fetch dari URL Supabase Storage
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          photoFolder.file(fileName, blob);
        }
      } catch (err) {
        console.warn(`Gagal mengambil foto ${i + 1}:`, err);
        // Lanjut ke foto berikutnya kalau satu gagal
      }

      onProgress && onProgress(Math.round(((i + 1) / total) * 85));
    }
  }

  onProgress && onProgress(90);

  // --- 3. Generate & trigger download ---
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });

  onProgress && onProgress(100);

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${zipName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
