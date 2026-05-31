import { useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { Scene } from "./Scene";
import { LoadingOverlay } from "./LoadingOverlay";

/**
 * Client-only wrapper around the Three.js scene.
 *
 * This file pulls in @react-three/fiber, @react-three/drei and
 * @react-three/postprocessing — none of which are SSR-safe (they touch
 * `window`, `document`, WebGL, etc.). It is loaded exclusively via
 * `React.lazy()` from `ClientScene.tsx`, itself wrapped in `<ClientOnly>`,
 * so its module code never runs during SSR on Cloudflare.
 */
export default function ClientSceneImpl({
  onReady,
}: {
  onReady: (ready: boolean) => void;
}) {
  const { progress, active } = useProgress();

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => onReady(true), 800);
      return () => clearTimeout(t);
    }
  }, [active, progress, onReady]);

  return (
    <>
      <LoadingOverlay />
      <Scene />
    </>
  );
}
