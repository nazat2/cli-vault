import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const LINES = ["SIMPAN KODE.", "SIMPAN BUKTI."];

const TYPE_SPEED = 42; // ms per karakter saat ngetik
const DELETE_SPEED = 26; // ms per karakter saat hapus (lebih cepat, kerasa snappy)
const LINE_PAUSE = 160; // pause kecil pindah baris
const HOLD_DURATION = 2400; // berapa lama teks penuh ditahan sebelum dihapus
const RESTART_PAUSE = 350; // pause sebelum mulai ngetik ulang

// Bentuk kilat flat (gak ada blur/glow) biar nyatu sama gaya neubrutalism.
function BoltSpark({ onDone }) {
  return (
    <svg
      className="bolt-spark"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      onAnimationEnd={onDone}
      aria-hidden="true"
    >
      <polygon
        points="13,1 4,13 11,13 9,23 20,9 12,9"
        fill="#FFD400"
        stroke="#111111"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Hero() {
  const titleRef = useRef(null);
  const subRef = useRef(null);

  const [displayed, setDisplayed] = useState(["", ""]);
  const [boltKey, setBoltKey] = useState(0);
  const [showBolt, setShowBolt] = useState(false);

  // State mesin typewriter disimpan di ref, supaya gak kena masalah stale
  // closure pas dipanggil berulang lewat setTimeout berantai.
  const stateRef = useRef({ phase: "typing", lineIdx: 0, charIdx: 0 });
  const subtitleShownRef = useRef(false);

  useEffect(() => {
    let timer;
    let cancelled = false;

    function spark() {
      setBoltKey((k) => k + 1);
      setShowBolt(true);
    }

    function showSubtitleOnce() {
      if (subtitleShownRef.current) return;
      subtitleShownRef.current = true;
      if (subRef.current) {
        gsap.fromTo(
          subRef.current,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
        );
      }
    }

    function popTitle() {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current, { scale: 0.992 }, { scale: 1, duration: 0.1, ease: "power2.out" });
      }
    }

    function tick() {
      if (cancelled) return;
      const s = stateRef.current;

      if (s.phase === "typing") {
        if (s.lineIdx < LINES.length) {
          const line = LINES[s.lineIdx];
          if (s.charIdx <= line.length) {
            setDisplayed((prev) => {
              const next = [...prev];
              next[s.lineIdx] = line.slice(0, s.charIdx);
              return next;
            });
            if (s.charIdx > 0) spark();
            popTitle();
            s.charIdx++;
            timer = setTimeout(tick, TYPE_SPEED);
          } else {
            s.lineIdx++;
            s.charIdx = 0;
            timer = setTimeout(tick, LINE_PAUSE);
          }
        } else {
          showSubtitleOnce();
          s.phase = "holding";
          timer = setTimeout(tick, HOLD_DURATION);
        }
        return;
      }

      if (s.phase === "holding") {
        s.phase = "deleting";
        s.lineIdx = LINES.length - 1;
        s.charIdx = LINES[s.lineIdx].length;
        timer = setTimeout(tick, DELETE_SPEED);
        return;
      }

      if (s.phase === "deleting") {
        if (s.lineIdx < 0) {
          s.phase = "waiting";
          timer = setTimeout(tick, RESTART_PAUSE);
          return;
        }
        if (s.charIdx > 0) {
          s.charIdx--;
          const lineIdx = s.lineIdx;
          const charIdx = s.charIdx;
          setDisplayed((prev) => {
            const next = [...prev];
            next[lineIdx] = LINES[lineIdx].slice(0, charIdx);
            return next;
          });
          spark();
          popTitle();
          timer = setTimeout(tick, DELETE_SPEED);
        } else {
          s.lineIdx--;
          if (s.lineIdx >= 0) {
            s.charIdx = LINES[s.lineIdx].length;
          }
          timer = setTimeout(tick, DELETE_SPEED);
        }
        return;
      }

      if (s.phase === "waiting") {
        s.phase = "typing";
        s.lineIdx = 0;
        s.charIdx = 0;
        setDisplayed(["", ""]);
        timer = setTimeout(tick, 50);
      }
    }

    timer = setTimeout(tick, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const line1Done = displayed[0].length === LINES[0].length;

  return (
    <section className="hero">
      <h1 className="hero-title" ref={titleRef}>
        {displayed[0]}
        {line1Done && <br />}
        {displayed[1]}
        <span className="type-cursor-wrap">
          <span className="type-cursor" />
          {showBolt && <BoltSpark key={boltKey} onDone={() => setShowBolt(false)} />}
        </span>
      </h1>
      <p className="hero-sub" ref={subRef} style={{ opacity: 0 }}>
        Folder buat config CLI &amp; screenshot Packet Tracer kamu. Tersimpan aman di cloud,
        tinggal seret, klik, copy.
      </p>
    </section>
  );
}
