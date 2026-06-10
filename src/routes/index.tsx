import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ClientScene } from "@/components/ClientScene";
import { SkyBackground } from "@/components/SkyBackground";
import { ContactButton } from "@/components/ContactButton";
import { MenuButton } from "@/components/MenuButton";
import { ContactSection } from "@/components/ContactSection";
import { ProjectSection } from "@/components/ProjectSection";
import { PromoLink } from "@/components/PromoLink";
import neuroneImage from "@/assets/tas-du-neurone.png";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "L'Antilope volante" },
      { name: "description", content: "David Lelièvre vous présente L'Antilope volante — une expérience 3D immersive." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { property: "og:title", content: "L'Antilope volante" },
      { property: "og:description", content: "David Lelièvre vous présente L'Antilope volante — une expérience 3D immersive." },
      { property: "og:url", content: "https://antilope-volante.com/" },
      { property: "og:site_name", content: "L'Antilope volante" },
      { property: "og:image", content: "https://antilope-volante.com/models/og-antilope.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://antilope-volante.com/models/og-antilope.png" },
    ],
  }),
  component: Index,
});

const slides = [
  { text: "Naviguer avec agilité", hasArrow: true },
  { text: "Défiler pour découvrir", hasArrow: true },
  { text: "Conçu pour convaincre", hasArrow: true },
];

function TextCarousel({ visible }: { visible: boolean }) {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) { setShow(false); return; }
    const enterTimer = setTimeout(() => setShow(true), 1800);
    return () => clearTimeout(enterTimer);
  }, [visible]);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [show]);

  const scrollDown = () => {
    const target = document.getElementById("projet-1");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: window.innerHeight * 3, behavior: "smooth" });
    }
  };


  return (
    <div className="text-carousel" style={{ opacity: show ? 1 : 0, transition: 'opacity 0.6s ease', cursor: 'pointer' }} onClick={scrollDown}>
      <div className="text-carousel-track">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`text-carousel-slide ${i === index ? "active" : ""}`}
          >
            <span className="text-carousel-text">{slide.text}</span>
            {slide.hasArrow && (
              <span
                className="text-carousel-arrow"
                aria-label="Défiler vers le bas"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IntroOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    let rafId: number | null = null;
    let scrollY = window.scrollY;

    const apply = () => {
      rafId = null;
      const vh = window.innerHeight;
      // Real parallax: overlay translates up at 0.1x scroll speed
      const ty = -scrollY * 0.1;
      // Fade completes just before the Project section (spacer = 300vh)
      const p = Math.min(1, Math.max(0, scrollY / (vh * 2.8)));
      const scale = 1 - p * 0.08;
      const opacity = 1 - Math.pow(p, 2.5);
      el.style.transform = `translate3d(0, ${ty}px, 0) scale(${scale})`;
      el.style.opacity = String(opacity);
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      if (rafId === null) rafId = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={overlayRef} className="intro-overlay" style={{ willChange: 'transform, opacity' }}>
      <p className="intro-subtitle">David Lelièvre vous présente</p>
      <h1 className="intro-title">L'Antilope volante</h1>
      <TextCarousel visible={true} />
    </div>
  );
}
function Index() {
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <>
      <SkyBackground />

      <main className="fixed inset-0">
        <h1 className="sr-only">L'Antilope volante</h1>
        <ClientScene onReady={setSceneReady} />
      </main>

      {/* Sticky intro lives inside the spacer so it releases when project sections start */}
      <div className="relative h-[300vh]">
        <IntroOverlay />
      </div>
      <ContactButton />
      <MenuButton />

      {/* Defer the rest of the page until the 3D scene + header are ready */}
      {sceneReady && (
        <>
          <ProjectSection number="1" title="bYkeS" description={<>Ce projet, réalisé dans le cadre d'une formation en <strong className="emph-uxthinking">UX Thinking</strong>, explorait comment rendre l'achat d'un vélo à la fois simple, rapide et inspirant. L'idée était de présenter les produits efficacement, mais surtout de les montrer dans de vrais contextes d'utilisation afin d'aider l'usager à se projeter naturellement et à choisir plus facilement. L'expérience devait rester <span className="emph-fluide">fluide</span> du début jusqu'au panier, avec une <span className="emph-navlegere">navigation légère</span>, <span className="emph-dynamique">dynamique</span> et agréable à parcourir. Une attention particulière a aussi été portée au sentiment de confiance, notamment grâce à des avis issus de vraies communautés et de véritables utilisateurs. Enfin, le parcours d'achat a été pensé pour éviter les hésitations inutiles : autocomplétion de l'adresse, étapes simplifiées et réduction des distractions au moment de finaliser la commande.</>} youtubeId="ZY7eEg_PSeU" />

          <ProjectSection number="2" title="T'as du neurone !" description={<>Jeu éducatif conçu pour être joué autant en salle de cinéma qu'en classe, transformant la révision scolaire en expérience collective, dynamique et amusante. Le projet met les élèves au défi à travers une série de questions et d'épreuves portant sur l'ensemble des notions vues durant l'année scolaire. Pensé pour <span className="emph-stimuler">stimuler</span> la participation et l'esprit d'équipe, le jeu cherche à rendre l'<span className="emph-apprentissage">apprentissage</span> plus vivant grâce à une <span className="emph-scene">mise en scène immersive</span>, un rythme soutenu et une ambiance inspirée des grands jeux-questionnaires interactifs.</>} imageUrl={neuroneImage} />
          
          <PromoLink />
          
          <ContactSection />
        </>
      )}
    </>
  );
}


