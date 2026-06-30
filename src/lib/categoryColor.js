// Setiap kategori otomatis dapat warna sendiri, konsisten (nama yang sama
// selalu menghasilkan warna yang sama), dari palet warna solid neubrutalism.
// Gak perlu setting manual — kategori baru otomatis kebagian warna.

const PALETTE = [
  { bg: "#FFD400", fg: "#111111" }, // kuning
  { bg: "#2B5BFF", fg: "#FFFFFF" }, // biru
  { bg: "#FF4F8B", fg: "#FFFFFF" }, // pink
  { bg: "#00C176", fg: "#FFFFFF" }, // hijau
  { bg: "#7C3AED", fg: "#FFFFFF" }, // ungu
  { bg: "#FF7A1A", fg: "#111111" }, // oranye
  { bg: "#00C2D1", fg: "#111111" }, // cyan
  { bg: "#FF3B3B", fg: "#FFFFFF" }, // merah
];

export function categoryColor(name) {
  const str = (name || "Umum").toLowerCase().trim() || "umum";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
