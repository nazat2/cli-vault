// Membubuhkan watermark "nazat" ke foto sebelum disimpan: badge jelas di
// pojok kanan-bawah (gak ada pola garis diagonal — cukup badge aja, lebih
// ringan & cepat diproses, terutama di HP).
//
// Hasilnya File baru (bukan memodifikasi file asli), siap diupload/disimpan.

const WATERMARK_TEXT = "nazat";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function waitForFonts() {
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch {
    // gak masalah kalau gagal, lanjut pakai font fallback
  }
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Gagal membaca gambar"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

export async function addWatermark(file) {
  await waitForFonts();
  const img = await loadImageFromFile(file);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // --- Badge jelas di pojok kanan-bawah ---
  const badgeFontSize = Math.max(14, Math.round(canvas.width * 0.032));
  ctx.font = `800 ${badgeFontSize}px 'JetBrains Mono', monospace`;
  const badgeText = `© ${WATERMARK_TEXT}`;
  const paddingX = badgeFontSize * 0.85;
  const paddingY = badgeFontSize * 0.55;
  const textWidth = ctx.measureText(badgeText).width;
  const badgeW = textWidth + paddingX * 2;
  const badgeH = badgeFontSize + paddingY * 2;
  const margin = Math.max(10, Math.round(canvas.width * 0.025));
  const bx = canvas.width - badgeW - margin;
  const by = canvas.height - badgeH - margin;
  const radius = badgeH * 0.22;

  ctx.fillStyle = "rgba(15,15,17,0.82)";
  roundRect(ctx, bx, by, badgeW, badgeH, radius);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,212,0,0.9)";
  ctx.lineWidth = Math.max(1.5, badgeFontSize * 0.07);
  roundRect(ctx, bx, by, badgeW, badgeH, radius);
  ctx.stroke();

  ctx.fillStyle = "#FFD400";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, bx + paddingX, by + badgeH / 2 + badgeFontSize * 0.04);

  const outType = file.type && file.type !== "image/gif" ? file.type : "image/png";

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal membuat watermark"))), outType, 0.92);
  });

  return new File([blob], file.name, { type: outType, lastModified: Date.now() });
}
