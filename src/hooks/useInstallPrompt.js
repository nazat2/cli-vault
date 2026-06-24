import { useEffect, useState } from "react";

export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Sudah berjalan sebagai app terinstall (standalone mode)?
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setInstalled(isStandalone);

    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredEvent(e);
      setSupported(true);
    }
    function handleInstalled() {
      setInstalled(true);
      setDeferredEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredEvent) return "unsupported";
    deferredEvent.prompt();
    const choice = await deferredEvent.userChoice;
    setDeferredEvent(null);
    return choice.outcome; // "accepted" | "dismissed"
  }

  return { canInstall: supported && !installed, installed, promptInstall };
}
