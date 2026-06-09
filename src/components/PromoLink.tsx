import { Link } from "@tanstack/react-router";

export function PromoLink() {
  return (
    <div className="promo-link-wrapper">
      <Link
        to="/video-projets"
        className="project-watch-button"
      >
        DÉcouVriR →
      </Link>
    </div>
  );
}