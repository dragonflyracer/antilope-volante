import { createFileRoute } from "@tanstack/react-router";
import AntelopeRunner from "@/components/AntelopeRunner";

export const Route = createFileRoute("/jeu")({
  head: () => ({
    meta: [
      { title: "L'Antilope volante — Jeu" },
      { name: "description", content: "Faites galoper l'antilope dans ce runner paysage." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "L'Antilope volante — Jeu" },
      { property: "og:description", content: "Faites galoper l'antilope dans ce runner paysage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JeuPage,
});

function JeuPage() {
  return (
    <div className="dark">
      <AntelopeRunner />
    </div>
  );
}
