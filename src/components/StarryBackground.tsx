import { useEffect, useRef } from "react";

const StarryBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createStar = () => {
      const star = document.createElement("div");
      const size = Math.random() * 4 + 1;
      const left = Math.random() * 100;
      const duration = Math.random() * 8 + 6;
      const delay = Math.random() * 5;

      star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        top: -10px;
        background: radial-gradient(circle, rgba(255,215,0,1) 0%, rgba(255,215,0,0.5) 40%, transparent 70%);
        border-radius: 50%;
        animation: fall ${duration}s linear ${delay}s infinite;
        pointer-events: none;
        box-shadow: 0 0 ${size * 3}px rgba(255,215,0,0.6), 0 0 ${size * 6}px rgba(255,215,0,0.3);
      `;
      container.appendChild(star);
      return star;
    };

    const stars = Array.from({ length: 40 }, createStar);

    return () => {
      stars.forEach((s) => s.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

export default StarryBackground;
