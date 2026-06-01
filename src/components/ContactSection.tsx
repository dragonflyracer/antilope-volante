import { Copy, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import powderBurst from "@/assets/powder-burst.webm";

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasPlayedRef = useRef(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("david.lelievre99@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail if clipboard API is unavailable
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPlayedRef.current) {
            hasPlayedRef.current = true;
            video.currentTime = 0;
            video.play().catch(() => {});
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="contact-section" ref={sectionRef}>
      <video
        ref={videoRef}
        className="contact-powder-burst"
        src={powderBurst}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="contact-content">
        <h2 className="contact-title">Contacter l'antilope !</h2>

        <div className="contact-slogan">
          <svg viewBox="0 0 600 120" width="100%" height="120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path
                id="sloganCurve"
                d="M 20 80 Q 150 20 300 60 T 580 80"
                fill="none"
              />
            </defs>
            <text fill="#ffffff" fontFamily="Raleway, sans-serif" fontWeight="100" fontSize="24" letterSpacing="0.04em">
              <textPath href="#sloganCurve" startOffset="50%" textAnchor="middle">
                Attrapons votre idée avant qu'elle ne s'enfuie
              </textPath>
            </text>
          </svg>
        </div>

        <div className="contact-info">
          <div className="contact-link-wrapper">
            <a
              href="mailto:david.lelievre99@gmail.com"
              className="contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <span className="contact-text">david.lelievre99@gmail.com</span>
            </a>
            <button
              className="contact-copy-btn"
              onClick={handleCopyEmail}
              aria-label="Copier l'email"
              title="Copier l'email"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <a
            href="tel:+14189982199"
            className="contact-link"
          >
            <span className="contact-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </span>
            <span className="contact-text">418-998-2199</span>
          </a>
        </div>

        <p className="contact-message">Vos appels ou vos messages sont un plaisir !</p>
      </div>
    </section>
  );
}
