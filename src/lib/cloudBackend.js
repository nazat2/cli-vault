// Backend "CLOUD" — pakai Supabase (Postgres + Storage).
// Tabel: public.folders (id, name, code, images jsonb, created_at)
// Storage bucket: images

import { supabase } from "./supabase.js";

const TABLE = "folders";
const BUCKET = "images";

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    code: row.code || "",
    category: row.category || "Umum",
    images: row.images || [],
    createdAt: row.created_at,
  };
}

/**
 * Subscribe ke perubahan data folder secara realtime.
 * Mengembalikan fungsi unsubscribe.
 */
export function subscribeFolders(onChange, onError) {
  let active = true;

  async function fetchAll() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      onError && onError(error);
      return;
    }
    if (active) onChange(data.map(mapRow));
  }

  fetchAll();

  const channel = supabase
    .channel("folders-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, () => {
      fetchAll();
    })
    .subscribe();

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}

/**
 * Upload beberapa file foto ke Supabase Storage di path {folderId}/...
 * Mengembalikan array of { url, path }
 */
export async function uploadImages(folderId, files) {
  const uploaded = [];
  for (const file of files) {
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const path = `${folderId}/${safeName}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    uploaded.push({ url: data.publicUrl, path });
  }
  return uploaded;
}

/**
 * Buat folder baru: upload foto dulu (kalau ada), lalu insert baris ke tabel folders.
 */
export async function createFolder({ name, code, files, category }) {
  const id = uid();

  let images = [];
  if (files && files.length) {
    images = await uploadImages(id, files);
  }

  const { error } = await supabase.from(TABLE).insert({
    id,
    name,
    code: code || "",
    category: category?.trim() || "Umum",
    images,
  });
  if (error) throw error;

  return id;
}

/**
 * Hapus folder: hapus semua file foto di Storage, lalu hapus baris di tabel.
 */
export async function deleteFolder(folder) {
  if (folder.images && folder.images.length) {
    const paths = folder.images.map((img) => img.path).filter(Boolean);
    if (paths.length) {
      await supabase.storage.from(BUCKET).remove(paths).catch(() => {});
    }
  }

  const { error } = await supabase.from(TABLE).delete().eq("id", folder.id);
  if (error) throw error;
}

/**
 * Update folder yang sudah ada: nama, kode, kategori, foto baru (di-upload), dan foto lama
 * yang dihapus user (dihapus juga dari Storage).
 */
export async function updateFolder(id, { name, code, category, newFiles, keepImages, removedPaths }) {
  let images = keepImages ? [...keepImages] : [];

  if (removedPaths && removedPaths.length) {
    await supabase.storage.from(BUCKET).remove(removedPaths).catch(() => {});
  }

  if (newFiles && newFiles.length) {
    const uploaded = await uploadImages(id, newFiles);
    images = [...images, ...uploaded];
  }

  const { error } = await supabase
    .from(TABLE)
    .update({ name, code: code || "", category: category?.trim() || "Umum", images })
    .eq("id", id);
  if (error) throw error;
}
