import { createFileRoute } from "@tanstack/react-router";
import AntelopeRunnerLevel2 from "@/components/AntelopeRunnerLevel2";

export const Route = createFileRoute("/jeu-2")({
  head: () => ({
    meta: [
      { title: "L'Antilope volante — Niveau 2" },
      {
        name: "description",
        content: "Le défi ultime de L'Antilope volante.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "L'Antilope volante — Niveau 2" },
      {
        property: "og:description",
        content: "Le défi ultime de L'Antilope volante.",
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
      <AntelopeRunnerLevel2 level={2} />
    </div>
  );
}