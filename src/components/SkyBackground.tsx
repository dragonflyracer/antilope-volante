import { useEffect, useRef, useState } from "react";
import background from "@/assets/background.png";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Dreamy animated sky background.
 *
 * Combines:
 * - constant slow horizontal drift (infinite, seamless feel)
 * - subtle sinusoidal vertical float (wind sensation)
 * - scroll-driven vertical offset (gazelle ascending through atmosphere)
 */
export function SkyBackground() {
  const ref = useRef<HTMLDivElement | null>(null);

  const isMobile = useIsMobile();

  const [lowPowerDevice, setLowPowerDevice] = useState(false);

  const disableBlur = isMobile || lowPowerDevice;

  useEffect(() => {
  if (typeof navigator !== "undefined") {
    setLowPowerDevice(
      navigator.hardwareConcurrency <= 4
    );
  }
}, []);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    // Throttle to ~30fps on mobile to halve CPU/paint cost
    const minFrameMs = isMobile ? 33 : 0;
    let lastFrame = 0;

    const tick = (now: number) => {
      if (now - lastFrame >= minFrameMs) {
        lastFrame = now;
        const el = ref.current;
        if (el) {
          const elapsed = (now - start) / 1000;

          const ambientDrift = elapsed * 24;
          const maxScroll = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight
          );
          const t = Math.min(1, Math.max(0, window.scrollY / maxScroll));
          const orbitCounter = t * 600;
          const driftX = (ambientDrift + orbitCounter) % 100000;
          const floatY = Math.sin(elapsed * 0.25) * 8;
          const scrollOffset = t * 120;

          el.style.backgroundPosition = `${driftX}px ${floatY - scrollOffset}px`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

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
        // `filter: blur` recomposite chaque frame — trop coûteux sur GPU mobile
        filter: disableBlur ? "saturate(1.05)" : "blur(3px) saturate(1.05)",
        transform: "scale(1.06)",
      }}
    />
  );
}
