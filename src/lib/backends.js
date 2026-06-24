import * as cloud from "./cloudBackend.js";
import * as local from "./localBackend.js";

/**
 * Mengembalikan modul backend yang sesuai dengan mode aktif.
 * Kedua backend punya interface yang sama:
 *   subscribeFolders(onChange, onError) -> unsubscribe()
 *   createFolder({ name, code, files }) -> Promise<id>
 *   deleteFolder(folder) -> Promise<void>
 */
export function getBackend(mode) {
  return mode === "cloud" ? cloud : local;
}
