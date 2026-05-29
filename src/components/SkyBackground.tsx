import { useEffect, useRef } from "react";
import background from "@/assets/background.png";

/**
 * Dreamy animated sky background.
 *
 * Combines:
 * - constant slow horizontal drift (infinite, seamless feel)
 * - subtle sinusoidal vertical float (wind sensation)
 * - scroll-driven vertical offset (gazelle ascending through atmosphere)
 *
 * The image is scaled up so motion never reveals the edges.
 */
export function SkyBackground() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const el = ref.current;
      if (el) {
        const elapsed = (now - start) / 1000; // seconds

        // Constant slow ambient horizontal drift (always moving)
        const ambientDrift = elapsed * 24; // px/sec

        // Scroll-driven horizontal shift — opposite of the camera orbit direction.
        // Camera orbits with increasing angle (sin grows), so sky moves the other way.
        const maxScroll = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const t = Math.min(1, Math.max(0, window.scrollY / maxScroll));
        const orbitCounter = t * 600; // px counter-shift across full scroll

        const driftX = (ambientDrift + orbitCounter) % 100000;

        // Soft sinusoidal vertical float
        const floatY = Math.sin(elapsed * 0.25) * 8;

        // Scroll-driven vertical offset — sky drifts upward as user scrolls down
        const scrollOffset = t * 120; // px upward at full scroll

        el.style.backgroundPosition = `${driftX}px ${floatY - scrollOffset}px`;

      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-0 -z-10"
      style={{
        backgroundImage: `url(${background})`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 120%",
        willChange: "background-position",
        filter: "blur(6px) saturate(1.05)",
        transform: "scale(1.06)", // avoid blurred edges showing
      }}

    />
  );
}
