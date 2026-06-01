import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { Scene } from "./Scene";
import { LoadingOverlay } from "./LoadingOverlay";

/**
 * Client-only wrapper around the Three.js scene.
 * Fades the gazelle in once the model is fully loaded.
 */
export default function ClientSceneImpl({
  onReady,
}: {
  onReady: (ready: boolean) => void;
}) {
  const { progress, active } = useProgress();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => {
        setRevealed(true);
        onReady(true);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [active, progress, onReady]);

  return (
    <>
      <LoadingOverlay />
      <div
        className="fixed inset-0"
        style={{
          opacity: revealed ? 1 : 0,
          transition: "opacity 1.6s ease-out",
          pointerEvents: revealed ? "auto" : "none",
        }}
      >
        <Scene />
      </div>
    </>
  );
}
