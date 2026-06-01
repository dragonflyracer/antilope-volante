import { useEffect, useState, type ReactNode } from "react";

interface ProjectSectionProps {
  number: string;
  title?: string;
  description?: ReactNode;
  imageUrl?: string;
  /** YouTube video or Short ID (e.g. "ZY7eEg_PSeU") */
  youtubeId?: string;
}


export function ProjectSection({
  number,
  title = "Titre du projet",
  description = "Description du projet à venir. Présentez ici le contexte, votre rôle, les défis relevés et le résultat obtenu.",
  imageUrl,
  youtubeId,
}: ProjectSectionProps) {
  const [ytBlurred, setYtBlurred] = useState(true);
  useEffect(() => {
    if (!youtubeId) return;
    const t = setTimeout(() => setYtBlurred(false), 3000);
    return () => clearTimeout(t);
  }, [youtubeId]);

  return (
    <section id={`projet-${number}`} className="project-section">

      <div className="project-heading">
        <span className="project-label">PROJET</span>
        <span className="project-number-circle">{number}</span>
      </div>

      {youtubeId ? (
        <div className="project-stacked">
          <div className="project-text project-text-centered">
            <h2 className="project-title">{title}</h2>
            <p className="project-description">{description}</p>
          </div>

          <div className="project-short">
            <div className="project-short-frame">
              <div className="project-short-overlay" />
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&playsinline=1&loop=1&controls=0&autoplay=1&mute=1&playlist=${youtubeId}`}
                title={title}
                loading="eager"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  filter: ytBlurred ? 'blur(24px)' : 'none',
                  transition: 'filter 600ms ease-out',
                }}
              />

            </div>
          </div>
        </div>
      ) : imageUrl ? (
        <div className="project-stacked">
          <div className="project-text project-text-centered">
            <h2 className="project-title">{title}</h2>
            <p className="project-description">{description}</p>
          </div>

          <div className="project-short">
            <div className="project-short-frame">
              <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="project-content">
          <div className="project-text">
            <h2 className="project-title">{title}</h2>
            <p className="project-description">{description}</p>
          </div>
          <div className="project-image">
            <div className="project-image-placeholder">Image du projet</div>
          </div>
        </div>
      )}
    </section>
  );
}
