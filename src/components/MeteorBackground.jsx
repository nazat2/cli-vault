import { useEffect, useRef } from "react";

function hexToRgb(hex, fallback) {
  const clean = (hex || fallback).trim().replace("#", "");
  if (clean.length !== 6) return hexToRgb(fallback, "111111");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}

// Background animasi bintang + hujan meteor, warnanya dipakein palet brand
// (kuning/biru/pink/hijau) biar nyatu sama gaya neubrutalism, bukan tema
// galaxy-glow yang biasa. Ringan: 1 canvas, requestAnimationFrame, otomatis
// jadi statis (gak animasi) kalau pengguna aktifkan "Reduce Motion".
export default function MeteorBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const root = getComputedStyle(document.documentElement);
    const bgRgb = hexToRgb(root.getPropertyValue("--bg"), "#F2EFE4");
    const inkRgb = hexToRgb(root.getPropertyValue("--ink"), "#111111");
    const accents = [
      hexToRgb(root.getPropertyValue("--yellow"), "#FFD400"),
      hexToRgb(root.getPropertyValue("--blue"), "#2B5BFF"),
      hexToRgb(root.getPropertyValue("--pink"), "#FF4F8B"),
      hexToRgb(root.getPropertyValue("--green"), "#00C176"),
    ];
    // pasangan warna kepala->ekor meteor, gabungan 2 warna brand berbeda
    const meteorPairs = [
      [accents[0], accents[1]],
      [accents[1], accents[2]],
      [accents[2], accents[3]],
      [accents[3], accents[0]],
    ];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars = [];
    let meteors = [];
    let rafId = null;
    let spawnTimer = null;
    let running = true;

    function initStars() {
      const count = Math.max(26, Math.min(85, Math.floor((w * h) / 15000)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.4,
        a: Math.random() * 0.4 + 0.1,
        da: (Math.random() * 0.01 + 0.003) * (Math.random() < 0.5 ? -1 : 1),
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
      drawFrame(); // redraw langsung biar gak kosong sesaat pas resize
    }

    function spawnMeteor() {
      const pair = meteorPairs[Math.floor(Math.random() * meteorPairs.length)];
      meteors.push({
        x: Math.random() * w * 1.3 - w * 0.15,
        y: -30,
        len: Math.random() * 100 + 65,
        speed: Math.random() * 5 + 6,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        life: 0,
        maxLife: Math.random() * 55 + 50,
        c1: pair[0],
        c2: pair[1],
        width: Math.random() * 1.1 + 1.2,
      });
    }

    function drawFrame() {
      ctx.clearRect(0, 0, w, h);

      // dasar krem — menggantikan background polos body, jadi nyatu
      ctx.fillStyle = `rgb(${bgRgb})`;
      ctx.fillRect(0, 0, w, h);

      // tekstur bintang/grain halus
      for (const s of stars) {
        if (!reduceMotion) {
          s.a += s.da;
          if (s.a <= 0.08 || s.a >= 0.5) s.da *= -1;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${inkRgb},${Math.max(0, Math.min(0.5, s.a))})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduceMotion) {
        for (const m of meteors) {
          m.x += Math.cos(m.angle) * m.speed;
          m.y += Math.sin(m.angle) * m.speed;
          m.life++;
          const fadeIn = Math.min(1, m.life / 8);
          const fadeOut = 1 - Math.max(0, (m.life - (m.maxLife - 16)) / 16);
          const opacity = Math.max(0, Math.min(fadeIn, fadeOut)) * 0.8;

          const tailX = m.x - Math.cos(m.angle) * m.len;
          const tailY = m.y - Math.sin(m.angle) * m.len;
          const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
          grad.addColorStop(0, `rgba(${m.c1},${opacity})`);
          grad.addColorStop(0.5, `rgba(${m.c2},${opacity * 0.45})`);
          grad.addColorStop(1, `rgba(${m.c2},0)`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = m.width;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // kepala meteor: bulatan solid + outline hitam tipis — ciri khas neubrutalism
          ctx.beginPath();
          ctx.fillStyle = `rgba(${m.c1},${opacity})`;
          ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(${inkRgb},${opacity * 0.85})`;
          ctx.stroke();
        }
        meteors = meteors.filter(
          (m) => m.life < m.maxLife && m.y < h + 150 && m.x > -250 && m.x < w + 250
        );
      }
    }

    function loop() {
      drawFrame();
      if (running && !reduceMotion) rafId = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);

    let firstSpawnTimer = null;

    if (!reduceMotion) {
      spawnTimer = setInterval(() => {
        if (Math.random() < 0.55 && meteors.length < 4) spawnMeteor();
      }, 2200);
      firstSpawnTimer = setTimeout(spawnMeteor, 500);
    }

    loop(); // sekali jalan: animasi terus kalau motion diizinkan, statis kalau gak

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (spawnTimer) clearInterval(spawnTimer);
      if (firstSpawnTimer) clearTimeout(firstSpawnTimer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="meteor-bg-canvas" ref={canvasRef} aria-hidden="true" />;
}
