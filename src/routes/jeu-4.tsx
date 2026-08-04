import { createFileRoute } from "@tanstack/react-router";
import AntelopeRunnerLevel4 from "@/components/AntelopeRunnerLevel4";

export const Route = createFileRoute("/jeu-4")({
  head: () => ({
    meta: [
      { title: "L'Antilope volante — Niveau 4" },
      {
        name: "description",
        content: "Le défi ULTIME de L'Antilope volante.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "L'Antilope volante — Niveau 4" },
      {
        property: "og:description",
        content: "Le défi ULTIME de L'Antilope volante.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Jeu4Page,
});

function Jeu4Page() {
  return (
    <div className="dark">
      <AntelopeRunnerLevel4 level={4} />
    </div>
  );
}