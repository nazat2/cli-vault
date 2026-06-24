// Menyimpan pilihan mode penyimpanan: "local" (localStorage, buat testing)
// atau "cloud" (Supabase). Default "local" supaya app langsung bisa dicoba
// tanpa setup apapun.

const KEY = "clivault_mode";
let listeners = [];

export function getMode() {
  return localStorage.getItem(KEY) || "local";
}

export function setMode(mode) {
  localStorage.setItem(KEY, mode);
  listeners.forEach((fn) => fn(mode));
}

export function subscribeModeChange(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
