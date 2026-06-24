import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Hero() {
  const titleRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    gsap.fromTo(subRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: "power3.out" });
  }, []);

  return (
    <section className="hero">
      <h1 className="hero-title" ref={titleRef}>
        SIMPAN KODE.
        <br />
        SIMPAN BUKTI.
      </h1>
      <p className="hero-sub" ref={subRef}>
        Folder buat config CLI &amp; screenshot Packet Tracer kamu. Tersimpan aman di cloud, tinggal seret, klik, copy.
      </p>
    </section>
  );
}
