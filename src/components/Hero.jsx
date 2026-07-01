import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const LINES = ["SIMPAN KODE.", "SIMPAN BUKTI."];

const TYPE_SPEED = 95; // ms per karakter saat ngetik — pelan & santai
const DELETE_SPEED = 55; // ms per karakter saat hapus
const LINE_PAUSE = 320; // pause pindah baris
const HOLD_DURATION = 3200; // berapa lama teks penuh ditahan sebelum dihapus
const RESTART_PAUSE = 600; // pause sebelum mulai ngetik ulang

export default function Hero() {
  const subRef = useRef(null);
  const [displayed, setDisplayed] = useState(["", ""]);

  // State mesin typewriter disimpan di ref, supaya gak kena masalah stale
  // closure pas dipanggil berulang lewat setTimeout berantai.
  const stateRef = useRef({ phase: "typing", lineIdx: 0, charIdx: 0 });
  const subtitleShownRef = useRef(false);

  useEffect(() => {
    let timer;
    let cancelled = false;

    function showSubtitleOnce() {
      if (subtitleShownRef.current) return;
      subtitleShownRef.current = true;
      if (subRef.current) {
        gsap.fromTo(
          subRef.current,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
        );
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

    timer = setTimeout(tick, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const line1Done = displayed[0].length === LINES[0].length;

  return (
    <section className="hero">
      <h1 className="hero-title">
        {displayed[0]}
        {line1Done && <br />}
        {displayed[1]}
        <span className="type-cursor" />
      </h1>
      <p className="hero-sub" ref={subRef} style={{ opacity: 0 }}>
        Folder buat config CLI &amp; screenshot Packet Tracer kamu. Tersimpan aman di cloud,
        tinggal seret, klik, copy.
      </p>
    </section>
  );
}
