// Backend "LOCAL" — semua data disimpan di localStorage browser ini saja.
// Dipakai untuk testing/coba-coba sebelum setup Supabase, atau kalau memang
// gak butuh sinkron antar device. Foto disimpan sebagai base64 data URL.

const KEY = "clivault_local_folders";
let listeners = [];

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Gagal membaca data lokal:", e);
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  listeners.forEach((fn) => fn(list));
}

function sorted(list) {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

function uid() {
  return "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Subscribe ke perubahan data folder (mirip interface backend cloud).
 * Mengembalikan fungsi unsubscribe.
 */
export function subscribeFolders(onChange) {
  onChange(sorted(readAll()));
  const listener = (list) => onChange(sorted(list));
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/**
 * Buat folder baru di localStorage. Foto dikonversi ke base64 data URL.
 */
export async function createFolder({ name, code, files }) {
  const images = [];
  if (files && files.length) {
    for (const file of files) {
      const dataUrl = await fileToDataUrl(file);
      images.push({ url: dataUrl, path: null });
    }
  }
  const list = readAll();
  const newItem = {
    id: uid(),
    name,
    code: code || "",
    images,
    createdAt: Date.now(),
  };
  list.push(newItem);
  writeAll(list);
  return newItem.id;
}

/**
 * Hapus folder dari localStorage.
 */
export async function deleteFolder(folder) {
  const list = readAll().filter((f) => f.id !== folder.id);
  writeAll(list);
}

/**
 * Update folder yang sudah ada: nama, kode, dan foto (foto baru + foto lama yang masih disimpan).
 */
export async function updateFolder(id, { name, code, newFiles, keepImages }) {
  const list = readAll();
  const idx = list.findIndex((f) => f.id === id);
  if (idx === -1) throw new Error("Folder tidak ditemukan");

  let images = keepImages ? [...keepImages] : [];
  if (newFiles && newFiles.length) {
    for (const file of newFiles) {
      const dataUrl = await fileToDataUrl(file);
      images.push({ url: dataUrl, path: null });
    }
  }

  list[idx] = {
    ...list[idx],
    name,
    code: code || "",
    images,
  };
  writeAll(list);
}
