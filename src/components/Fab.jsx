import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Fab({ onClick }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, delay: 0.3, ease: "back.out(2)" }
      );
    }
  }, []);

  return (
    <button className="fab" ref={ref} onClick={onClick} aria-label="Tambah folder">
      +
    </button>
  );
}
