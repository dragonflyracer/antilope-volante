import { useState, useEffect } from "react";

/**
 * Fixed half-circle contact button stuck to the right edge of the viewport.
 * The text "Contactez-moi" follows the curved (left) edge of the half-circle.
 * Turns orange when scrolled into the project section.
 */

type ContactButtonProps = {
  isContactVisible: boolean;
};

export function ContactButton({ isContactVisible }: ContactButtonProps) {
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
    if (isContactVisible) {
      window.location.href =
        "https://www.facebook.com/antilopevolante";
      return;
    }

    const target = document.getElementById("contact");
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const content = (
    <svg
      viewBox="0 0 80 160"
      className="contact-semi-svg"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <path
          id="arc-path"
          d="M 80,12 A 68,68 0 0,0 80,148"
          fill="none"
        />
      </defs>

      <path
        d="M 80,0 A 80,80 0 0,0 80,160 Z"
        className="contact-semi-shape"
        strokeWidth="1"
      />

      {isContactVisible ? (
        <text
          x="42"
          y="88"
          textAnchor="middle"
          className="facebook-f"
        >
          f
        </text>
      ) : (
        <text className="contact-semi-text" textAnchor="middle">
          <textPath href="#arc-path" startOffset="50%">
            Contactez-moi
          </textPath>
        </text>
      )}
    </svg>
  );

  return isContactVisible ? (
    <a
      href="https://www.facebook.com/antilopevolante"
      target="_blank"
      rel="noopener noreferrer"
      className="contact-semi-btn contact-facebook"
      aria-label="Facebook"
    >
      {content}
    </a>
  ) : (
    <button
      onClick={handleClick}
      className={`contact-semi-btn ${
        isContactVisible
          ? "contact-facebook"
          : isOrange
            ? "contact-orange"
            : ""
      }`}
      aria-label="Contactez-moi"
    >
      {content}
    </button>
  );
}