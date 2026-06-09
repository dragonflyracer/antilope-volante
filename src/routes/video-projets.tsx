import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/video-projets")({
  head: () => ({
    meta: [
      { title: "Vidéos de projets | L'Antilope volante" },
      {
        name: "description",
        content: "Découvrez les vidéos de projets de L'Antilope volante.",
      },
    ],
  }),
  component: VideoProjectsPage,
});

function VideoProjectsPage() {
  const [blurred, setBlurred] = useState(true);

useEffect(() => {
  const t = setTimeout(() => {
    setBlurred(false);
  }, 2500);

  return () => clearTimeout(t);
}, []);
  return (
    <div className="video-overlay-page">
      <Link
        to="/"
        className="video-overlay-close"
        aria-label="Retour à l'accueil"
      >
        ×
      </Link>

      <div className="video-overlay-content">
        <div className="video-frame">
          <div className="video-frame-overlay" />

          <iframe
            src="https://www.youtube-nocookie.com/embed/c9IlZXSfsZU?autoplay=1&mute=1&rel=0&playsinline=1&controls=0&loop=1&playlist=c9IlZXSfsZU"
            title="L'Antilope volante"
            loading="eager"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              filter: blurred ? "blur(24px)" : "none",
              transition: "filter 800ms ease-out",
            }}
          />
        </div>
      </div>
    </div>
  );
}