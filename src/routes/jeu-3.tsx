import { createFileRoute } from "@tanstack/react-router";
import AntelopeRunnerLevel3 from "@/components/AntelopeRunnerLevel3";

export const Route = createFileRoute("/jeu-3")({
  head: () => ({
    meta: [
      { title: "L'Antilope volante — Niveau 3" },
      {
        name: "description",
        content: "Le défi FOU de L'Antilope volante.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "L'Antilope volante — Niveau 3" },
      {
        property: "og:description",
        content: "Le défi FOU de L'Antilope volante.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Jeu2Page,
});

function Jeu2Page() {
  return (
    <div className="dark">
      <AntelopeRunnerLevel3 level={3} />
    </div>
  );
}