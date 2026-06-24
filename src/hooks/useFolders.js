import { useEffect, useState } from "react";
import { getBackend } from "../lib/backends.js";
import { supabaseReady } from "../lib/supabase.js";

export function useFolders(mode) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setFolders([]);

    if (mode === "cloud" && !supabaseReady) {
      setLoading(false);
      setError("not-configured");
      return;
    }

    const backend = getBackend(mode);
    const unsub = backend.subscribeFolders(
      (list) => {
        setFolders(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError(err?.message || "unknown-error");
        setLoading(false);
      }
    );

    return () => unsub && unsub();
  }, [mode]);

  return { folders, loading, error };
}
