import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// Lazy import: the implementation module (and therefore three / @react-three/*
// / postprocessing) is only evaluated in the browser bundle. On the server,
// <ClientOnly> renders the fallback and `lazy` never resolves.
const Inner = lazy(() => import("./ClientScene.impl"));

/**
 * SSR-safe entry point for the 3D scene.
 *
 * - On the server: renders `null` (nothing Three.js-related is imported or executed).
 * - On the client: after hydration, dynamically loads the Three.js scene and
 *   the loading overlay, and reports readiness via `onReady`.
 */
export function ClientScene({
  onReady,
}: {
  onReady: (ready: boolean) => void;
}) {
  return (
    <ClientOnly fallback={null}>
      <Suspense fallback={null}>
        <Inner onReady={onReady} />
      </Suspense>
    </ClientOnly>
  );
}
