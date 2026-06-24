import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useInstallPrompt } from "../hooks/useInstallPrompt.js";

const DISMISS_KEY = "clivault_install_dismissed_at";
const DISMISS_DAYS = 7;

function recentlyDismissed() {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const days = (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24);
  return days < DISMISS_DAYS;
}

export default function InstallPrompt({ showToast }) {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (canInstall && !installed && !recentlyDismissed()) {
      const t = setTimeout(() => setVisible(true), 1600);
      return () => clearTimeout(t);
    }
  }, [canInstall, installed]);

  useEffect(() => {
    if (visible && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 60, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.5)" }
      );
    }
  }, [visible]);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => setVisible(false),
      });
    } else {
      setVisible(false);
    }
  }

  async function handleInstall() {
    setInstalling(true);
    const result = await promptInstall();
    setInstalling(false);
    if (result === "accepted") {
      showToast("APP SEDANG DIINSTALL...");
      setVisible(false);
    } else if (result === "dismissed") {
      dismiss();
    } else {
      showToast("INSTALL BELUM DIDUKUNG DI BROWSER INI");
      dismiss();
    }
  }

  return (
    <div className="install-prompt-wrap">
      <div className="install-prompt-card" ref={cardRef}>
        <img src="/icons/icon-192.png" alt="CLI VAULT" className="install-prompt-icon" />
        <div className="install-prompt-body">
          <p className="install-prompt-title">INSTALL CLI VAULT?</p>
          <p className="install-prompt-text">
            Pasang sebagai app — buka langsung dari home screen, tanpa browser.
          </p>
        </div>
        <div className="install-prompt-actions">
          <button className="btn-close" onClick={dismiss} aria-label="Tutup">
            ✕
          </button>
          <button className="btn btn-install-now" onClick={handleInstall} disabled={installing}>
            {installing ? "..." : "📲 INSTALL"}
          </button>
        </div>
      </div>
    </div>
  );
}
