import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ClientScene } from "@/components/ClientScene";
import { SkyBackground } from "@/components/SkyBackground";
import { ContactButton } from "@/components/ContactButton";
import { MenuButton } from "@/components/MenuButton";
import { ContactSection } from "@/components/ContactSection";
import { ProjectSection } from "@/components/ProjectSection";
import neuroneImage from "@/assets/tas-du-neurone.png";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "L'Antilope volante" },
      { name: "description", content: "David Lelièvre vous présente L'Antilope volante — une expérience 3D immersive." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: Index,
});

const slides = [
  { text: "Mon univers du UX", hasArrow: false },
  { text: "Défiler pour découvrir", hasArrow: true },
  { text: "Défiler sur le web avec la facilité d'une gazelle", hasArrow: false },
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
    }, 3500);
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
  const [overlayOpacity, setOverlayOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const animationRange = Math.max(1, window.innerHeight * 3);
      // Fade out starts at 70% of the animation range, fully transparent at 100%
      const fadeStart = animationRange * 0.7;
      const fadeEnd = animationRange;
      const scrollY = window.scrollY;

      if (scrollY <= fadeStart) {
        setOverlayOpacity(1);
      } else if (scrollY >= fadeEnd) {
        setOverlayOpacity(0);
      } else {
        const progress = (scrollY - fadeStart) / (fadeEnd - fadeStart);
        setOverlayOpacity(1 - progress);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hidden = overlayOpacity < 0.02;

  return (
    <div
      className="intro-overlay"
      style={{
        opacity: overlayOpacity,
        transition: "opacity 0.15s linear",
        pointerEvents: hidden ? "none" : "none",
      }}
    >
      <p
        className="intro-subtitle"
        style={{ opacity: hidden ? 0 : undefined }}
      >
        David Lelièvre vous présente
      </p>
      <h1
        className="intro-title"
        style={{ opacity: hidden ? 0 : undefined }}
      >
        L'Antilope volante
      </h1>
      <TextCarousel visible={!hidden} />
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

      <IntroOverlay />
      <ContactButton />
      <MenuButton />
      {/* Tall spacer to drive the camera animation (gazelle rotation) */}
      <div className="h-[300vh]" />

      {/* Defer the rest of the page until the 3D scene + header are ready */}
      {sceneReady && (
        <>
          <ProjectSection number="1" title="bYkeS" description={<>Ce projet, réalisé dans le cadre d'une formation en <strong className="emph-uxthinking">UX Thinking</strong>, explorait comment rendre l'achat d'un vélo à la fois simple, rapide et inspirant. L'idée était de présenter les produits efficacement, mais surtout de les montrer dans de vrais contextes d'utilisation afin d'aider l'usager à se projeter naturellement et à choisir plus facilement. L'expérience devait rester <span className="emph-fluide">fluide</span> du début jusqu'au panier, avec une <span className="emph-navlegere">navigation légère</span>, <span className="emph-dynamique">dynamique</span> et agréable à parcourir. Une attention particulière a aussi été portée au sentiment de confiance, notamment grâce à des avis issus de vraies communautés et de véritables utilisateurs. Enfin, le parcours d'achat a été pensé pour éviter les hésitations inutiles : autocomplétion de l'adresse, étapes simplifiées et réduction des distractions au moment de finaliser la commande.</>} youtubeId="ZY7eEg_PSeU" />

          <ProjectSection number="2" title="T'as du neurone !" description={<>Jeu éducatif conçu pour être joué autant en salle de cinéma qu'en classe, transformant la révision scolaire en expérience collective, dynamique et amusante. Le projet met les élèves au défi à travers une série de questions et d'épreuves portant sur l'ensemble des notions vues durant l'année scolaire. Pensé pour <span className="emph-stimuler">stimuler</span> la participation et l'esprit d'équipe, le jeu cherche à rendre l'<span className="emph-apprentissage">apprentissage</span> plus vivant grâce à une <span className="emph-scene">mise en scène immersive</span>, un rythme soutenu et une ambiance inspirée des grands jeux-questionnaires interactifs.</>} imageUrl={neuroneImage} />
          <ContactSection />
        </>
      )}
    </>
  );
}


