import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";
import petal from "@/assets/petal.png";

/**
 * Elegant fullscreen loading overlay shown while the 3D model loads.
 * Rose petals swirl around the progress indicator, then everything fades out.
 */
export function LoadingOverlay() {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  if (!visible) return null;

  const done = !active && progress >= 100;

  // Petals distributed around the swirl with varied radii, sizes, durations.
  const petals = [
    { r: 70,  size: 54, dur: 3.2, delay: 0,    op: 0.95 },
    { r: 95,  size: 42, dur: 4.1, delay: -0.6, op: 0.85 },
    { r: 110, size: 64, dur: 5.0, delay: -1.2, op: 0.9  },
    { r: 85,  size: 36, dur: 3.6, delay: -1.8, op: 0.75 },
    { r: 125, size: 48, dur: 4.6, delay: -2.4, op: 0.8  },
    { r: 60,  size: 30, dur: 2.8, delay: -0.3, op: 0.7  },
    { r: 140, size: 58, dur: 5.6, delay: -3.0, op: 0.85 },
    { r: 100, size: 40, dur: 4.3, delay: -1.5, op: 0.8  },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-transparent transition-opacity duration-700"
      style={{ opacity: done ? 0 : 1, pointerEvents: done ? "none" : "auto" }}
      aria-busy={!done}
      aria-live="polite"
    >
      {/* Swirling petals */}
      <div className="relative mb-10 h-[320px] w-[320px]">
        {petals.map((p, i) => (
          <div
            key={i}
            className="petal-orbit"
            style={{
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <img
              src={petal}
              alt=""
              aria-hidden
              className="petal-img"
              style={{
                width: p.size,
                height: "auto",
                transform: `translateX(${p.r}px)`,
                opacity: p.op,
              }}
            />
          </div>

        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="h-px w-40 overflow-hidden bg-foreground/10">
          <div
            className="h-full bg-foreground/70 transition-[width] duration-300 ease-out"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className="text-xs tracking-[0.3em] uppercase text-foreground/60">
          Chargement
        </p>
      </div>
    </div>
  );
}
