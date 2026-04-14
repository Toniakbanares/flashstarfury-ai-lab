import { useEffect, useRef } from "react";

interface StarryBackgroundProps {
  theme?: "dark" | "light" | "nature";
}

const StarryBackground = ({ theme = "dark" }: StarryBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getStarColor = () => {
      switch (theme) {
        case "light": return { r: 255, g: 180, b: 0 };
        case "nature": return { r: 100, g: 220, b: 80 };
        default: return { r: 255, g: 215, b: 0 };
      }
    };

    const color = getStarColor();

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
        background: radial-gradient(circle, rgba(${color.r},${color.g},${color.b},1) 0%, rgba(${color.r},${color.g},${color.b},0.5) 40%, transparent 70%);
        border-radius: 50%;
        animation: fall ${duration}s linear ${delay}s infinite;
        pointer-events: none;
        box-shadow: 0 0 ${size * 3}px rgba(${color.r},${color.g},${color.b},0.6), 0 0 ${size * 6}px rgba(${color.r},${color.g},${color.b},0.3);
      `;
      container.appendChild(star);
      return star;
    };

    const stars = Array.from({ length: theme === "light" ? 25 : 40 }, createStar);

    return () => { stars.forEach((s) => s.remove()); };
  }, [theme]);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true" />
  );
};

export default StarryBackground;
