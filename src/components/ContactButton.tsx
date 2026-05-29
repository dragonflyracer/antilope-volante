import { useState, useEffect } from "react";

/**
 * Fixed half-circle contact button stuck to the right edge of the viewport.
 * The text "Contactez-moi" follows the curved (left) edge of the half-circle.
 * Turns orange when scrolled into the project section.
 */
export function ContactButton() {
  const [isOrange, setIsOrange] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 3;
      setIsOrange(window.scrollY >= threshold);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const target = document.getElementById("contact");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`contact-semi-btn ${isOrange ? "contact-orange" : ""}`}
      aria-label="Contactez-moi"
    >
      <svg
        viewBox="0 0 80 160"
        className="contact-semi-svg"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Arc following the curved left edge, from top to bottom */}
          <path
            id="arc-path"
            d="M 80,12 A 68,68 0 0,0 80,148"
            fill="none"
          />
        </defs>
        {/* Half-circle (D shape) bulging to the left, flat against the right edge */}
        <path
          d="M 80,0 A 80,80 0 0,0 80,160 Z"
          className="contact-semi-shape"
          strokeWidth="1"
        />
        <text className="contact-semi-text" textAnchor="middle">
          <textPath href="#arc-path" startOffset="50%">
            Contactez-moi
          </textPath>
        </text>
      </svg>
    </button>
  );
}
