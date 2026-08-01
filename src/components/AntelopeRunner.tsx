import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import skyImg from "@/assets/day-sky.jpg";
import hillsImg from "@/assets/day-hills.png";
import grassBackImg from "@/assets/grass-back.png";
import grassFrontImg from "@/assets/grass-front.png";
import cloudsImg from "@/assets/cloud-pillars.png";

import f1 from "@/assets/run-01.png";
import f2 from "@/assets/run-02.png";
import f3 from "@/assets/run-03.png";
import f4 from "@/assets/run-04.png";
import f5 from "@/assets/run-05.png";
import f6 from "@/assets/run-06.png";
import f7 from "@/assets/run-07.png";
import f8 from "@/assets/run-08.png";
import f9 from "@/assets/run-09.png";
import f10 from "@/assets/run-10.png";
import f11 from "@/assets/run-11.png";
import f12 from "@/assets/run-12.png";
import { Button } from "@/components/ui/button";
import { Share2, Volume2, VolumeX } from "lucide-react";
const musicAsset = { url: "/sky-antelope.mp3" };

const FRAMES = [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12];

// ============== Performance tuning ==============
// Mid-range phones benefit from fewer draw calls and simpler shaders.
type Quality = "high" | "medium" | "low";

const QUALITY_LIMITS: Record<Quality, { maxParticles: number; maxSwirls: number; maxClouds: number; cloudPuffs: number; analyserSkip: number; blur: boolean }> = {
  // maxSwirls est identique partout : c'est du gameplay, pas de la décoration.
  high:   { maxParticles: 55, maxSwirls: 7, maxClouds: 4, cloudPuffs: 26, analyserSkip: 1, blur: true },
  medium: { maxParticles: 34, maxSwirls: 7, maxClouds: 3, cloudPuffs: 18, analyserSkip: 3, blur: true },
  low:    { maxParticles: 20, maxSwirls: 7, maxClouds: 2, cloudPuffs: 12, analyserSkip: 5, blur: false },
};

function detectInitialQuality(): Quality {
  if (typeof window === "undefined") return "medium";
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 2;
  const ua = navigator.userAgent;
  const isLowEnd = /Android [4-7]|iPhone OS [7-9]/.test(ua);
  // iOS ne expose pas deviceMemory : les iPhone récents sont au moins "medium".
  const isApple = /iPhone|iPad|Macintosh/.test(ua);
  if (isLowEnd || (mem && mem <= 3) || (!isApple && cores <= 4)) return "low";
  if ((mem && mem <= 6) || cores <= 6) return "medium";
  return "high";
}

/** Bande défilante en boucle (deux tuiles miroir) pour un effet de parallaxe. */
function ParallaxLayer({
  src,
  scroll,
  k,
  className = "",
  style,
  size = "100% 100%",
}: {
  src: string;
  scroll: number;
  k: number;
  className?: string;
  style?: React.CSSProperties;
  size?: string;
}) {
  const period = 2;
  const p = (((scroll * k) % period) + period) % period;
  return (
    <>
      {[0, 1].map((i) => {
        const offset = (((i - p) % period) + period) % period;
        return (
          <div
            key={i}
            className={`absolute ${className}`}
            style={{
              ...style,
              width: "100%",
              transform: `translateX(${(offset - 1) * 100}%) scaleX(${i % 2 === 0 ? 1 : -1})`,
              backgroundImage: `url(${src})`,
              backgroundSize: size,
              backgroundRepeat: "no-repeat",
              willChange: "transform",
            }}
          />
        );
      })}
    </>
  );
}

/** Plante étrange colorée servant d'obstacle. */
function StrangePlant({
  x,
  w,
  h,
  kind,
}: {
  x: number;
  w: number;
  h: number;
  kind: 0 | 1 | 2;
}) {
  // Forme déterministe basée sur le kind pour éviter les sauts visuels.
  const seed = kind * 17.3 + 0.5;
  const rnd = (k: number) =>
    Math.abs(Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1;

  const stemBend = (rnd(1) - 0.5) * 36; // courbure de la tige
  const leaves = [0.35, 0.58, 0.78].map((py, i) => ({
    y: 100 - py * 100,
    side: i % 2 === 0 ? -1 : 1,
    len: 28 + rnd(i + 2) * 22,
    angle: 35 + rnd(i + 5) * 30,
  }));

  const bulbCount = 5 + kind;
  const petals = useMemo(
    () =>
      Array.from({ length: bulbCount }).map((_, i) => {
        const angle = (i / bulbCount) * 360 + rnd(i + 8) * 40;
        const len = 18 + rnd(i + 12) * 14;
        return { angle, len };
      }),
    [bulbCount, kind],
  );

  return (
    <div
      className="absolute"
      style={{
        left: `${(x / W) * 100}%`,
        bottom: `${((H - GROUND_Y) / H) * 100}%`,
        width: `${(w / W) * 100}%`,
        height: `${(h / H) * 100}%`,
        filter: kind === 2 ? "hue-rotate(-18deg)" : undefined,
        willChange: "transform",
      }}
    >
      <svg
        className="h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`plant-grad-${kind}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.5 0.24 292)" />
            <stop offset="35%" stopColor="oklch(0.62 0.27 350)" />
            <stop offset="70%" stopColor="oklch(0.75 0.2 45)" />
            <stop offset="100%" stopColor="oklch(0.86 0.17 88)" />
          </linearGradient>
        </defs>
        <g fill={`url(#plant-grad-${kind})`}>
          {/* Base rampante au sol */}
          <ellipse cx={50} cy={96} rx={42 + rnd(3) * 10} ry={8} opacity={0.85} />
          {/* Tige ondulée */}
          <path
            d={`M50,96 Q${50 + stemBend},70 ${50 - stemBend * 0.4},50 T50,18`}
            stroke={`url(#plant-grad-${kind})`}
            strokeWidth={7 + kind * 2}
            strokeLinecap="round"
            fill="none"
          />
          {/* Feuilles / lancettes le long de la tige */}
          {leaves.map((l, i) => {
            const rad = (l.angle * Math.PI) / 180;
            const dx = Math.cos(rad) * l.len * l.side;
            const dy = Math.sin(rad) * l.len;
            return (
              <path
                key={i}
                d={`M${50 - stemBend * 0.02 * (100 - l.y)},${l.y} Q${50 + dx * 0.5},${l.y - dy * 0.4} ${50 + dx},${l.y - dy} Q${50 + dx * 0.2},${l.y - dy * 0.2} ${50 - stemBend * 0.02 * (100 - l.y)},${l.y - 6}`}
              />
            );
          })}
          {/* Bulbe / fleur étrange au sommet */}
          {petals.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180;
            const r = p.len;
            const cx = 50 + Math.cos(rad) * r * 0.55;
            const cy = 18 + Math.sin(rad) * r * 0.55;
            return (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx={r * 0.45}
                ry={r * 0.75}
                transform={`rotate(${p.angle - 90}, ${cx}, ${cy})`}
              />
            );
          })}
          <circle cx={50} cy={18} r={8 + kind * 2} opacity={0.9} />
        </g>
      </svg>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: "var(--shadow-glow)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

// Virtual world in a 1000 x 400 landscape space, scaled to the viewport.
const W = 1000;
const H = 400;
const GROUND_Y = 320;
const RUNNER_X = 170;
const RUNNER_W = 92;
const RUNNER_H = 63;
// L'antilope est posée un peu plus bas pour que les sabots touchent le sol.
const GROUND_SINK = 16;
const GRAVITY = 2300;
// « L'Antilope volante » : la descente est bien plus lente que la montée.
const FALL_GRAVITY = GRAVITY * 0.38;
const JUMP_V = 830;
// Saut variable : au relâchement, la vitesse ascendante est coupée.
const JUMP_CUT = 0.32;
const DOUBLE_JUMP_V = 560; // second bond en l'air, plus petit
const MAX_HOLD = 0.24; // s — au-delà, hauteur maximale atteinte


type Obstacle = { id: number; x: number; w: number; h: number; kind: 0 | 1 | 2 };

type Puff = { l: number; t: number; w: number; h: number; o: number };

/** Plateforme de nuage : un banc de nuage qui enveloppe le sol et sur lequel on marche. */
type Cloud = { id: number; x: number; w: number; top: number; puffs: Puff[] };

/** Petite particule vaporeuse émise quand l'antilope court sur un nuage. */
type Particle = { id: number; x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue?: number };

/** Petit tourbillon à attraper : rend des points pour compenser le temps en l'air. */
type Swirl = { id: number; x: number; y: number; size: number; phase: number; blue?: boolean; red?: boolean; baseY?: number; amp?: number; freq?: number };
const SWIRL_VALUE = 60;
const BLUE_SWIRL_VALUE = 200;
/** Galaxies rouges : elles n'arrivent que dans les montées d'intensité de la musique. */
const RED_SWIRL_VALUE = 450;
const CLOUD_THICK = 34;

// On abaisse la surface de marche invisible pour que les sabots touchent le corps du nuage.
const CLOUD_PLATFORM_OFFSET = 18;

/** Opacité douce à l'entrée et à la sortie de l'écran (pas d'apparition/disparition sèche). */
const cloudOpacity = (x: number, w: number) => {
  const fadeW = 260;
  if (x > W) return 0;
  if (x > W - fadeW) return (W - x) / fadeW;
  if (x + w < 0) return 0;
  if (x + w < fadeW) return (x + w) / fadeW;
  return 1;
};

/** Génère une silhouette de nuage bosselée une seule fois à la création. */
function makeCloudPuffs(id: number, count: number): Puff[] {
  const rnd = (k: number) =>
    Math.abs(Math.sin(id * 12.9898 + k * 78.233) * 43758.5453) % 1;
  const puffs: Puff[] = [];
  const addRow = (
    key: number,
    n: number,
    from: number,
    to: number,
    top: number,
    wMin: number,
    wMax: number,
    hRatio: number,
    opacity: number,
  ) => {
    for (let i = 0; i < n; i++) {
      const p = n === 1 ? 0.5 : i / (n - 1);
      const jitter = (rnd(key * 13 + i) - 0.5) * ((to - from) / n) * 0.9;
      const w = wMin + rnd(key * 29 + i) * (wMax - wMin);
      const h = w * hRatio * (0.8 + rnd(key * 37 + i) * 0.5);
      puffs.push({
        l: from + p * (to - from) + jitter - w / 2,
        t: top + (rnd(key * 41 + i) - 0.5) * 9,
        w,
        h,
        o: opacity * (0.82 + rnd(key * 53 + i) * 0.25),
      });
    }
  };
  // Chapeau (sommet à peu près plat mais bosselé)
  addRow(1, Math.ceil(count * 0.23), 6, 94, 6, 30, 44, 0.62, 1);
  addRow(2, Math.ceil(count * 0.15), 14, 86, 20, 34, 50, 0.7, 0.98);
  // Corps qui s'élargit
  addRow(3, Math.ceil(count * 0.19), -18, 118, 40, 42, 62, 0.68, 0.95);
  addRow(4, Math.ceil(count * 0.18), -42, 142, 62, 46, 70, 0.66, 0.9);
  // Jupe basse très large qui se dissout dans le sol
  addRow(5, Math.ceil(count * 0.15), -70, 170, 86, 52, 82, 0.6, 0.85);
  addRow(6, Math.max(1, count - puffs.length), -95, 195, 104, 58, 90, 0.55, 0.7);
  return puffs;
}

type Phase = "idle" | "running" | "over" | "won";

/** Longueur du parcours, en pixels de défilement (~60 s de course). */
const RACE_LENGTH = 26000;

/**
 * Certains navigateurs intégrés (Facebook, Instagram…) verrouillent l'orientation.
 * On force alors un rendu paysage par rotation CSS.
 */
export default function AntelopeRunner() {
  const [vp, setVp] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const update = () =>
      setVp({
        w: window.visualViewport?.width ?? window.innerWidth,
        h: window.visualViewport?.height ?? window.innerHeight,
      });
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);

  const isPortrait = vp.w > 0 && vp.h > vp.w;

  if (!isPortrait)
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <div
          className="relative w-full overflow-hidden sm:rounded-2xl sm:shadow-2xl"
          style={{
            height: "100%",
            maxWidth: 1280,
            maxHeight: 720,
            aspectRatio: "16 / 9",
          }}
        >
          <RunnerGame />
        </div>
      </div>
    );


  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: vp.h,
          height: vp.w,
          transformOrigin: "top left",
          transform: `rotate(90deg) translateY(-${vp.w}px)`,
        }}
      >
        <RunnerGame />
      </div>
    </div>
  );
}

function RunnerGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [renderTick, setRenderTick] = useState(0);
  const [speed, setSpeed] = useState(340);
  const [y, setY] = useState(0);
  const [frame, setFrame] = useState(0);
  const [quality, setQuality] = useState<Quality>(() => detectInitialQuality());
  const [progress, setProgress] = useState(0);

  const g = useRef({
    y: 0,
    vy: 0,
    grounded: true,
    holding: false,
    holdT: 0,
    jumps: 0,
    scroll: 0,
    speed: 340,
    score: 0,
    frameT: 0,
    frame: 0,
    spawnIn: 1.1,
    obstacles: [] as Obstacle[],
    clouds: [] as Cloud[],
    cloudIn: 3,
    support: 0, // hauteur du sol courant (0 = terre, sinon dessus du nuage)
    particles: [] as Particle[],
    particleIn: 0,
    swirls: [] as Swirl[],
    swirlIn: 1.2,
    t: 0,
    intensity: 0, // 0..1 — énergie de la musique (lissée)
    groundTime: 0, // temps cumulé au sol pour booster le score
    dist: 0, // distance parcourue (px) — sert de ligne d'arrivée
    nextId: 1,
    phase: "idle" as Phase,
    // Performance monitoring
    fpsFrames: 0,
    fpsElapsed: 0,
    lowFpsStreak: 0,
    analyserSkip: 0,
  });

  const raf = useRef<number>(0);
  const last = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqRef = useRef<Uint8Array | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);

  const limits = QUALITY_LIMITS[quality];

  /** Branche un analyseur sur la musique pour détecter les passages plus rapides / intenses. */
  const setupAnalyser = useCallback(() => {
    const a = audioRef.current;
    if (!a || analyserRef.current) return;
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaElementSource(a);
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      an.smoothingTimeConstant = 0.75;
      src.connect(an);
      an.connect(ctx.destination);
      analyserRef.current = an;
      freqRef.current = new Uint8Array(an.frequencyBinCount);
      void ctx.resume().catch(() => {});
    } catch {
      /* analyse audio indisponible : on retombe sur le mode calme */
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      const a = audioRef.current;
      if (a) {
        a.muted = next;
        if (!next) {
          void a.play().catch(() => {});
          setupAnalyser();
        }
      }
      return next;
    });
  }, [setupAnalyser]);

  const start = useCallback(() => {
    const a = audioRef.current;
    if (a && !a.muted) {
      void a.play().catch(() => {});
      setupAnalyser();
    }
    void audioCtxRef.current?.resume().catch(() => {});
    g.current = {
      ...g.current,
      y: 0,
      vy: 0,
      grounded: true,
      jumps: 0,
      scroll: 0,
      speed: 340,
      score: 0,
      spawnIn: 1.1,
      obstacles: [],
      clouds: [],
      cloudIn: 3,
      support: 0,
      particles: [],
      particleIn: 0,
      swirls: [],
      swirlIn: 1.2,
      t: 0,
      intensity: 0,
      groundTime: 0,
      dist: 0,
      phase: "running",
      fpsFrames: 0,
      fpsElapsed: 0,
      lowFpsStreak: 0,
      analyserSkip: 0,
    };
    setScore(0);
    setProgress(0);
    setY(0);
    setSpeed(340);
    setFrame(0);
    setPhase("running");
    setRenderTick((n) => n + 1);
  }, [setupAnalyser]);

  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => {
    let u = window.location.href;
    try {
      if (window.top !== window.self && document.referrer) u = document.referrer;
    } catch {
      if (document.referrer) u = document.referrer;
    }
    setPageUrl(u.split("?")[0]);
  }, []);

  const bestScore = Math.max(score, best);
  const shareText = `J'ai fait ${bestScore} points à L'Antilope volante ! Peux-tu faire mieux ?`;
  // On encode le score dans l'URL partagée : même si Facebook ignore le texte,
  // le lien porte le score.
  const shareUrl = pageUrl ? `${pageUrl}?score=${bestScore}` : "";
  const fbShareHref = shareUrl
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    : "https://www.facebook.com/";

  const shareScore = useCallback(async () => {
    const fullShareText = `${shareText} ${shareUrl}`;

    // Facebook supprime souvent le texte prérempli. Une carte-image garantit
    // que le score reste visible dans la publication choisie par le joueur.
    let scoreFile: File | undefined;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const context = canvas.getContext("2d");
      if (context) {
        const background = context.createLinearGradient(0, 0, 1200, 630);
        background.addColorStop(0, "#5d42b8");
        background.addColorStop(0.52, "#e54c91");
        background.addColorStop(1, "#f2bd42");
        context.fillStyle = background;
        context.fillRect(0, 0, 1200, 630);
        context.fillStyle = "rgba(255,255,255,0.96)";
        context.textAlign = "center";
        context.font = "700 54px system-ui, sans-serif";
        context.fillText("L’Antilope volante", 600, 155);
        context.font = "900 150px system-ui, sans-serif";
        context.fillText(`${bestScore}`, 600, 365);
        context.font = "700 46px system-ui, sans-serif";
        context.fillText("POINTS", 600, 445);
        context.font = "600 32px system-ui, sans-serif";
        context.fillText("Peux-tu faire mieux ?", 600, 535);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (blob) scoreFile = new File([blob], `antilope-volante-${bestScore}-points.png`, { type: "image/png" });
      }
    } catch {
      /* création d'image indisponible */
    }

    try {
      await navigator.clipboard?.writeText(fullShareText);
    } catch {
      /* clipboard indisponible */
    }

    if (navigator.share && shareUrl) {
      try {
        const shareData: ShareData = {
          title: "L'Antilope volante",
          text: shareText,
          url: shareUrl,
        };
        if (scoreFile && navigator.canShare?.({ files: [scoreFile] })) {
          shareData.files = [scoreFile];
        }
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    // Sur ordinateur, le composeur web Facebook reste la solution de repli.
    window.open(fbShareHref, "_blank", "noopener,noreferrer");
  }, [bestScore, fbShareHref, shareUrl, shareText]);



  const jump = useCallback(() => {
    const s = g.current;
    if (s.phase === "idle") return start();
    if (s.phase === "over") return start();
    if (s.grounded) {
      s.vy = JUMP_V;
      s.grounded = false;
      s.jumps = 1;
      s.holding = true;
      s.holdT = 0;
    } else {
      s.vy = DOUBLE_JUMP_V;
      s.jumps += 1;
      s.holding = true;
      s.holdT = 0;
    }
  }, [start]);

  const releaseJump = useCallback(() => {
    const s = g.current;
    if (s.holding) {
      s.holding = false;
      if (s.vy > 0) s.vy *= JUMP_CUT;
    }
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "Enter") {
        e.preventDefault();
        if (!e.repeat) jump();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "Enter") releaseJump();
    };
    window.addEventListener("keydown", key);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("keyup", up);
    };
  }, [jump, releaseJump]);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem("antelope-best") ?? 0);
    if (!Number.isNaN(stored)) setBest(stored);
  }, []);

  useEffect(() => {
    const loop = (t: number) => {
      raf.current = requestAnimationFrame(loop);
      if (!last.current) last.current = t;
      const dt = Math.min((t - last.current) / 1000, 0.05);
      last.current = t;
      const s = g.current;

      // ---- Adaptive FPS monitoring ----
      s.fpsFrames += 1;
      s.fpsElapsed += dt;
      if (s.fpsElapsed >= 1) {
        const fps = s.fpsFrames / s.fpsElapsed;
        s.fpsFrames = 0;
        s.fpsElapsed = 0;
        if (fps < 42) {
          s.lowFpsStreak += 1;
          if (s.lowFpsStreak >= 2) {
            setQuality((q) => (q === "high" ? "medium" : q === "medium" ? "low" : "low"));
            s.lowFpsStreak = 0;
          }
        } else if (fps > 52) {
          s.lowFpsStreak = Math.max(0, s.lowFpsStreak - 1);
        }
      }

      // Gallop cycle always animates, faster while playing.
      // A complete cycle stays slow enough for every pose to be perceived.
      // Keep the remainder so low-refresh mobile screens never skip a frame.
      const fps = s.phase === "running" ? 18 + Math.min(4, (s.speed - 340) / 105) : 12;
      s.frameT += dt;
      if (s.frameT >= 1 / fps) {
        s.frameT -= 1 / fps;
        s.frame = (s.frame + 1) % FRAMES.length;
      }

      const bgSpeed = s.phase === "running" ? s.speed : 90;
      s.scroll += bgSpeed * dt;

      if (s.phase !== "running") {
        // Mise à jour visuelle minimale en idle/game-over
        setRenderTick((n) => n + 1);
        setFrame(s.frame);
        setY(s.y);
        setSpeed(s.speed);
        setScore(Math.floor(s.score));
        return;
      }

      s.speed = Math.min(760, s.speed + dt * 14);
      s.dist += s.speed * dt;
      const remainingDist = RACE_LENGTH - s.dist;

      // Plus l'antilope reste au sol, plus le score grimpe vite.
      const groundBonus = Math.min(s.groundTime, 3) * 0.08;
      const airPenalty = s.grounded ? 1 : 0.35;
      s.score += dt * s.speed * (0.1 + groundBonus) * airPenalty;

      // Vertical motion — gravité réduite tant que la touche est maintenue
      if (s.holding) {
        s.holdT += dt;
        if (s.holdT >= MAX_HOLD) {
          s.holding = false;
        }
      }
      const gravity =
        s.vy > 0 ? (s.holding ? GRAVITY * 0.45 : GRAVITY) : FALL_GRAVITY;
      const prevY = s.y;
      const wasGrounded = s.grounded;
      s.vy -= gravity * dt;
      s.y += s.vy * dt;

      // --- Nuages plateformes : défilement + spawn
      s.cloudIn -= dt;
      if (s.cloudIn <= 0) {
        const w = 300 + Math.random() * 240;
        s.clouds = [
          ...s.clouds,
          {
            id: s.nextId++,
            x: W + 140,
            w,
            top: 62 + Math.random() * 46,
            puffs: makeCloudPuffs(s.nextId, limits.cloudPuffs),
          },
        ];
        s.cloudIn = 4 + Math.random() * 3;
      }
      s.clouds = s.clouds
        .map((c) => ({ ...c, x: c.x - s.speed * dt }))
        .filter((c) => c.x + c.w > -140)
        .slice(-limits.maxClouds);

      // Support courant : le sol, ou le dessus d'un nuage traversé en descendant
      const cx = RUNNER_X + 20;
      const cw = RUNNER_W - 48;
      const over = s.clouds.filter((c) => c.x < cx + cw && c.x + c.w > cx);
      let landed = false;
      if (s.vy <= 0) {
        for (const c of over) {
          const platformY = c.top - CLOUD_PLATFORM_OFFSET;
          if (prevY >= platformY - 2 && s.y <= platformY) {
            s.y = platformY;
            s.vy = 0;
            s.grounded = true;
            s.jumps = 0;
            s.holding = false;
            s.support = platformY;
            landed = true;
            break;
          }
        }
      }
      // On quitte le nuage quand il s'éloigne sous les sabots
      if (!landed && s.support > 0) {
        const still = over.some(
          (c) => Math.abs(c.top - CLOUD_PLATFORM_OFFSET - s.support) < 2,
        );
        if (still && s.grounded) {
          s.y = s.support;
          s.vy = 0;
        } else if (!still) {
          s.support = 0;
          s.grounded = false;
        }
      }
      if (s.y <= 0) {
        s.y = 0;
        s.vy = 0;
        s.grounded = true;
        s.jumps = 0;
        s.holding = false;
        s.support = 0;
      }

      // Gestion du bonus au sol : plus on reste grounded, plus groundTime monte.
      if (s.grounded) {
        s.groundTime += dt;
        // Petit bonus à chaque atterrissage après un vrai vol.
        if (!wasGrounded && s.y > 2) {
          s.score += 35;
        }
      } else {
        s.groundTime = Math.max(0, s.groundTime - dt * 0.5);
      }

      // Particules vaporeuses quand l'antilope court sur un nuage
      if (s.grounded && s.support > 0 && s.phase === "running") {
        s.particleIn -= dt;
        if (s.particleIn <= 0) {
          const maxLife = 0.65 + Math.random() * 0.45;
          const size = 5 + Math.random() * 6;
          s.particles = [
            ...s.particles,
            {
              id: s.nextId++,
              x: RUNNER_X + 8 + Math.random() * 28,
              y: s.y + 2 + Math.random() * 8,
              vx: -80 - Math.random() * 100,
              vy: -15 - Math.random() * 45,
              life: maxLife,
              maxLife,
              size,
            },
          ];
          s.particleIn = 0.04 + Math.random() * 0.05;
        }
      }
      s.particles = s.particles
        .map((p) => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt, life: p.life - dt }))
        .filter((p) => p.life > 0)
        .slice(-limits.maxParticles);

      // --- Intensité de la musique (les passages rapides déclenchent les galaxies rouges)
      s.t += dt;
      s.analyserSkip += 1;
      {
        const an = analyserRef.current;
        const buf = freqRef.current;
        let energy = 0;
        if (an && buf && s.analyserSkip >= limits.analyserSkip) {
          s.analyserSkip = 0;
          an.getByteFrequencyData(buf as Uint8Array<ArrayBuffer>);
          // Bande medium/aiguë : elle monte quand le morceau s'emballe.
          const from = Math.floor(buf.length * 0.25);
          let sum = 0;
          for (let i = from; i < buf.length; i++) sum += buf[i];
          energy = sum / ((buf.length - from) * 255);
          energy = Math.min(1, energy * 2.6);
        }
        if (!an || energy < 0.06) {
          // Sans analyse audio : pulsation lente pour garder des vagues intrépides.
          // Sans analyse audio exploitable (iOS silencieux/bloqué) : pulsation lente
          // pour garder les vagues intrépides sur tous les appareils.
          energy = Math.max(energy, Math.max(0, Math.sin(s.t * 0.16) * 0.5 + 0.5) ** 2);
        }
        s.intensity += (energy - s.intensity) * Math.min(1, dt * 2.2);
      }
      const intense = s.intensity > 0.5;

      // --- Tourbillons à attraper (compensent la perte de points en l'air)
      s.swirlIn -= dt;
      if (s.swirlIn <= 0) {
        const r = Math.random();
        const red = intense && r < 0.45;
        const blue = !red && r < (intense ? 0.75 : 0.3);
        const size = red ? 26 + Math.random() * 14 : blue ? 30 + Math.random() * 16 : 34 + Math.random() * 20;
        const y = 30 + Math.random() * 210;
        s.swirls = [
          ...s.swirls,
          {
            id: s.nextId++,
            x: W + 60,
            y,
            size,
            phase: Math.random() * Math.PI * 2,
            ...(red
              ? { red: true, baseY: y, amp: 55 + Math.random() * 70, freq: 2.2 + Math.random() * 1.8 }
              : blue
              ? { blue: true, baseY: y, amp: 40 + Math.random() * 55, freq: 1.2 + Math.random() * 1.1 }
              : {}),
          },
        ];
        s.swirlIn = intense ? 0.28 + Math.random() * 0.5 : 0.7 + Math.random() * 1.1;
      }
      s.swirls = s.swirls
        .map((sw) => {
          const x = sw.x - s.speed * (sw.red ? 1.85 : sw.blue ? 1.25 : 1) * dt;
          const y =
            sw.blue || sw.red
              ? Math.max(20, (sw.baseY ?? sw.y) + Math.sin(s.t * (sw.freq ?? 1) + sw.phase) * (sw.amp ?? 50))
              : sw.y;
          return { ...sw, x, y };
        })
        .filter((sw) => sw.x > -100)
        .slice(-limits.maxSwirls);

      // Collecte : l'antilope traverse le tourbillon -> éclat de particules + points
      {
        const cx = RUNNER_X + RUNNER_W / 2;
        const cy = s.y + RUNNER_H / 2;
        const remaining: Swirl[] = [];
        for (const sw of s.swirls) {
          const swy = sw.y;
          const dx = sw.x + sw.size / 2 - cx;
          const dy = swy + sw.size / 2 - cy;
          if (Math.hypot(dx, dy) < sw.size * 0.6 + RUNNER_H * 0.35) {
            s.score += sw.red ? RED_SWIRL_VALUE : sw.blue ? BLUE_SWIRL_VALUE : SWIRL_VALUE;
            const burst: Particle[] = [];
            const n = Math.min(sw.red ? 32 : sw.blue ? 24 : 16, limits.maxParticles - s.particles.length);
            for (let i = 0; i < n; i++) {
              const a = (i / n) * Math.PI * 2 + Math.random();
              const sp = 90 + Math.random() * (sw.red ? 300 : sw.blue ? 210 : 150);
              const maxLife = 0.5 + Math.random() * 0.4;
              burst.push({
                id: s.nextId++,
                x: sw.x + sw.size / 2,
                y: swy + sw.size / 2 - GROUND_SINK,
                vx: Math.cos(a) * sp - s.speed * 0.25,
                vy: Math.sin(a) * sp,
                life: maxLife,
                maxLife,
                size: 6 + Math.random() * 7,
                hue: sw.red ? 3 : sw.blue ? 2 : 1,
              });
            }
            s.particles = [...s.particles, ...burst].slice(-limits.maxParticles);
          } else {
            remaining.push(sw);
          }
        }
        s.swirls = remaining;
      }

      // Obstacles
      s.spawnIn -= dt;
      if (s.spawnIn <= 0 && remainingDist > 900) {
        const kind = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        const h = kind === 0 ? 26 : kind === 1 ? 38 : 52;
        s.obstacles = [
          ...s.obstacles,
          { id: s.nextId++, x: W + 80, w: kind === 2 ? 26 : 22, h, kind },
        ];
        s.spawnIn = 0.75 + Math.random() * 0.9 - Math.min(0.35, s.speed / 2400);
      }
      s.obstacles = s.obstacles
        .map((o) => ({ ...o, x: o.x - s.speed * dt }))
        .filter((o) => o.x > -120);

      // Collision — forgiving hitbox around the antelope body.
      const rx = RUNNER_X + 20;
      const rw = RUNNER_W - 48;
      const ry = s.y + 6;
      const rh = RUNNER_H - 20;
      const hit = s.obstacles.some(
        (o) => o.x < rx + rw && o.x + o.w > rx && ry < o.h && ry + rh > 0,
      );
      if (hit) {
        s.phase = "over";
        setPhase("over");
        const final = Math.floor(s.score);
        setBest((b) => {
          const nb = Math.max(b, final);
          window.localStorage.setItem("antelope-best", String(nb));
          return nb;
        });
      }

      // --- Ligne d'arrivée
      if (s.phase === "running" && s.dist >= RACE_LENGTH) {
        s.score += 1500; // bonus d'arrivée
        s.phase = "won";
        setPhase("won");
        const final = Math.floor(s.score);
        setBest((b) => {
          const nb = Math.max(b, final);
          window.localStorage.setItem("antelope-best", String(nb));
          return nb;
        });
      }

      // ---- One render tick to rule them all ----
      setProgress(Math.min(1, s.dist / RACE_LENGTH));
      setRenderTick((n) => n + 1);
      setFrame(s.frame);
      setY(s.y);
      setSpeed(s.speed);
      setScore(Math.floor(s.score));
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [limits.maxClouds, limits.maxParticles, limits.maxSwirls, limits.cloudPuffs, limits.analyserSkip]);

  // Derived render lists — read from refs to avoid extra state allocations.
  const { obstacles, clouds, particles, swirls, scroll } = g.current;

  return (
    <div
      className="relative h-full w-full touch-none select-none overflow-hidden bg-background"
      onPointerDown={jump}
      onPointerUp={releaseJump}
      onPointerCancel={releaseJump}
      onPointerLeave={releaseJump}
      role="application"
      aria-label="Jeu de course d'antilope"
    >
      {/* Scene — parallax layers (ciel < collines < hautes herbes) */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, var(--sky-top), var(--sky-bottom) 82%)`,
          contain: "layout style paint",
        }}
      >
        {/* 1. Ciel de jour — dérive très lente */}
        <ParallaxLayer src={skyImg} scroll={scroll} k={0.00006} className="inset-0" size="cover" />

        {/* 2. Collines douces — vitesse moyenne */}
        <ParallaxLayer
          src={hillsImg}
          scroll={scroll}
          k={0.00026}
          className="inset-x-0"
          style={{
            bottom: `${((H - GROUND_Y) / H) * 100}%`,
            height: "28%",
            backgroundPosition: "bottom",
            filter: "saturate(1.1) brightness(0.98)",
          }}
        />

        {/* 2b. Colonnes de nuages majestueuses — passent devant les collines */}
        <ParallaxLayer
          src={cloudsImg}
          scroll={scroll}
          k={0.00042}
          size="100% 100%"
          className="inset-x-0 opacity-95"
          style={{
            bottom: `${((H - GROUND_Y) / H) * 100 - 2}%`,
            height: "72%",
            backgroundPosition: "bottom",
            filter: limits.blur ? "blur(3px) saturate(0.85) brightness(1.06)" : "saturate(0.85) brightness(1.06)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        />

        {/* Brume d'horizon verte et douce */}
        <div
          className="absolute inset-x-0 h-[18%]"
          style={{
            bottom: `${((H - GROUND_Y) / H) * 100}%`,
            background:
              "linear-gradient(to top, oklch(0.55 0.08 135 / 22%), transparent)",
          }}
        />

        {/* 3. Hautes herbes — derrière l'antilope */}
        <ParallaxLayer
          src={grassBackImg}
          scroll={scroll}
          k={0.0007}
          className="inset-x-0"
          style={{
            bottom: `calc(${((H - GROUND_Y) / H) * 100}% - 26px)`,
            height: "24%",
            backgroundPosition: "bottom",
            filter: "saturate(1.05) brightness(1.02)",
          }}
        />

        {/* Transition herbes → sol pour masquer la ligne blanche */}
        <div
          className="pointer-events-none absolute inset-x-0"
          style={{
            bottom: `${((H - GROUND_Y) / H) * 100}%`,
            height: "32px",
            background: "linear-gradient(to top, var(--ground), transparent)",
          }}
        />
      </div>

      {/* Ground */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: `${((H - GROUND_Y) / H) * 100}%`,
          background: `linear-gradient(to bottom, oklch(0.35 0.13 140), var(--ground) 22%)`,
          contain: "layout style paint",
        }}
      >
        {/* Ligne d'horizon en vert herbe naturel */}
        <div
          className="absolute inset-x-0 top-0 h-[8px]"
          style={{ backgroundColor: "oklch(0.24 0.16 140)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(78deg, transparent 0 46px, oklch(0.98 0.03 120) 46px 50px)",
            backgroundPositionX: `${-(scroll % 96)}px`,
            maskImage: "linear-gradient(to bottom, black, transparent 80%)",
            willChange: "background-position",
          }}
        />
      </div>

      {/* Playfield in virtual units */}
      <div
        className="absolute inset-0"
        style={{ contain: "layout style paint" }}
      >
        <div className="relative h-full w-full">
          {obstacles.map((o) => (
            <StrangePlant
              key={o.id}
              x={o.x}
              w={o.w}
              h={o.h}
              kind={o.kind}
            />
          ))}

          {/* Plateformes de nuage */}
          {clouds.map((c) => {
            const base = 44; // le nuage plonge sous le sol : il l'englobe
            const hPx = c.top + base;

            return (
              <div
                key={c.id}
                className="absolute"
                style={{
                  left: `${(c.x / W) * 100}%`,
                  bottom: `${((H - GROUND_Y - base) / H) * 100}%`,
                  width: `${(c.w / W) * 100}%`,
                  height: `${(hPx / H) * 100}%`,
                  opacity: cloudOpacity(c.x, c.w) * 0.92,
                  transition: "opacity 0.28s ease-out",
                  filter: limits.blur
                    ? "blur(5px) drop-shadow(0 12px 34px oklch(0.55 0.08 250 / 14%))"
                    : "drop-shadow(0 12px 34px oklch(0.55 0.08 250 / 14%))",
                  willChange: "transform, opacity",
                }}
              >
                {c.puffs.map((p, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${p.l}%`,
                      top: `${p.t}%`,
                      width: `${p.w}%`,
                      height: `${p.h}%`,
                      borderRadius: "50%",
                      opacity: p.o,
                      filter: "blur(2px)",
                      background:
  "radial-gradient(ellipse at 35% 28%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 34%, rgba(248,252,255,0.82) 65%, rgba(232,240,251,0.28) 88%, transparent 100%)",
                    }}
                  />
                ))}
              </div>
            );
          })}

          {/* Tourbillons à attraper */}
          {swirls.map((sw) => (
            <div
              key={sw.id}
              className={
                sw.red
                  ? "absolute animate-[spin_1.1s_linear_infinite]"
                  : sw.blue
                  ? "absolute animate-[spin_2.6s_linear_infinite]"
                  : "absolute animate-[spin_5s_linear_infinite]"
              }
              style={{
                left: `${(sw.x / W) * 100}%`,
                bottom: `calc(${((H - GROUND_Y - GROUND_SINK) / H) * 100}% + ${(sw.y / H) * 100}%)`,
                width: `${(sw.size / W) * 100}%`,
                aspectRatio: "1 / 1",
                pointerEvents: "none",
                willChange: "transform",
                filter: sw.red
                  ? "drop-shadow(0 0 18px oklch(0.65 0.25 27 / 85%))"
                  : sw.blue
                  ? "drop-shadow(0 0 14px oklch(0.75 0.19 240 / 80%))"
                  : "drop-shadow(0 0 10px oklch(0.75 0.2 350 / 65%))",
              }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                <defs>
                  <linearGradient id={`sw-${sw.id}`} x1="0" y1="0" x2="1" y2="1">
                    {sw.red ? (
                      <>
                        <stop offset="0%" stopColor="oklch(0.94 0.09 60)" />
                        <stop offset="40%" stopColor="oklch(0.78 0.2 40)" />
                        <stop offset="75%" stopColor="oklch(0.62 0.26 25)" />
                        <stop offset="100%" stopColor="oklch(0.45 0.22 15)" />
                      </>
                    ) : sw.blue ? (
                      <>
                        <stop offset="0%" stopColor="oklch(0.95 0.08 210)" />
                        <stop offset="40%" stopColor="oklch(0.82 0.15 225)" />
                        <stop offset="75%" stopColor="oklch(0.65 0.2 250)" />
                        <stop offset="100%" stopColor="oklch(0.5 0.2 265)" />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="oklch(0.86 0.17 88)" />
                        <stop offset="40%" stopColor="oklch(0.75 0.2 45)" />
                        <stop offset="75%" stopColor="oklch(0.62 0.27 350)" />
                        <stop offset="100%" stopColor="oklch(0.5 0.24 292)" />
                      </>
                    )}
                  </linearGradient>
                  <radialGradient id={`swc-${sw.id}`}>
                    {sw.red ? (
                      <>
                        <stop offset="0%" stopColor="oklch(0.99 0.04 70)" />
                        <stop offset="40%" stopColor="oklch(0.85 0.19 40)" />
                        <stop offset="100%" stopColor="oklch(0.6 0.26 25 / 0%)" />
                      </>
                    ) : sw.blue ? (
                      <>
                        <stop offset="0%" stopColor="oklch(0.99 0.03 210)" />
                        <stop offset="40%" stopColor="oklch(0.9 0.13 225)" />
                        <stop offset="100%" stopColor="oklch(0.7 0.2 250 / 0%)" />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="oklch(0.99 0.05 88)" />
                        <stop offset="40%" stopColor="oklch(0.9 0.16 75)" />
                        <stop offset="100%" stopColor="oklch(0.7 0.22 20 / 0%)" />
                      </>
                    )}
                  </radialGradient>
                  <radialGradient id={`swh-${sw.id}`}>
                    {sw.red ? (
                      <>
                        <stop offset="0%" stopColor="oklch(0.75 0.2 30 / 55%)" />
                        <stop offset="65%" stopColor="oklch(0.58 0.25 20 / 22%)" />
                        <stop offset="100%" stopColor="oklch(0.45 0.22 15 / 0%)" />
                      </>
                    ) : sw.blue ? (
                      <>
                        <stop offset="0%" stopColor="oklch(0.85 0.14 225 / 50%)" />
                        <stop offset="65%" stopColor="oklch(0.65 0.2 245 / 20%)" />
                        <stop offset="100%" stopColor="oklch(0.5 0.2 265 / 0%)" />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="oklch(0.8 0.16 330 / 45%)" />
                        <stop offset="65%" stopColor="oklch(0.6 0.24 300 / 18%)" />
                        <stop offset="100%" stopColor="oklch(0.5 0.24 292 / 0%)" />
                      </>
                    )}
                  </radialGradient>
                </defs>

                {/* Halo galactique */}
                <ellipse cx={50} cy={50} rx={46} ry={30} fill={`url(#swh-${sw.id})`} />

                {/* Bras spiraux */}
                <g
                  fill="none"
                  stroke={`url(#sw-${sw.id})`}
                  strokeLinecap="round"
                >
                  <path
                    d="M50,44 C60,42 70,46 74,54 C78,64 70,74 58,76 C42,79 28,68 27,53 C26,36 40,22 58,22"
                    strokeWidth={5}
                    opacity={0.95}
                  />
                  <path
                    d="M50,56 C40,58 30,54 26,46 C22,36 30,26 42,24 C58,21 72,32 73,47 C74,64 60,78 42,78"
                    strokeWidth={5}
                    opacity={0.8}
                  />
                  <path
                    d="M50,47 C57,45 64,49 65,55 C66,63 58,69 49,68"
                    strokeWidth={2.4}
                    opacity={0.55}
                  />
                  <path
                    d="M50,53 C43,55 36,51 35,45 C34,37 42,31 51,32"
                    strokeWidth={2.4}
                    opacity={0.55}
                  />
                </g>

                {/* Poussière d'étoiles */}
                <g fill="oklch(0.97 0.06 88)">
                  {[
                    [70, 32, 1.5],
                    [30, 66, 1.4],
                    [78, 60, 1.1],
                    [22, 40, 1.1],
                    [56, 80, 1.2],
                    [44, 18, 1.2],
                  ].map(([cx, cy, r], i) => (
                    <circle key={i} cx={cx} cy={cy} r={r} opacity={0.75} />
                  ))}
                </g>

                {/* Noyau lumineux */}
                <ellipse cx={50} cy={50} rx={13} ry={9} fill={`url(#swc-${sw.id})`} />
                <circle cx={50} cy={50} r={3.4} fill="oklch(0.99 0.03 88)" />
              </svg>
            </div>
          ))}

          {/* Particules vaporeuses derrière l'antilope */}
          {particles.map((p) => {
            const progress = p.life / p.maxLife;
            return (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${(p.x / W) * 100}%`,
                  bottom: `calc(${((H - GROUND_Y - GROUND_SINK) / H) * 100}% + ${(p.y / H) * 100}%)`,
                  width: `${(p.size / W) * 100}%`,
                  aspectRatio: "1 / 1",
                  opacity: progress * 0.9,
                  transform: `translate(-50%, -50%) scale(${0.4 + progress * 0.6})`,
                  background: p.hue === 3
                    ? "radial-gradient(circle, oklch(0.98 0.05 70) 0%, oklch(0.8 0.2 40) 42%, oklch(0.58 0.26 22 / 60%) 72%, transparent 100%)"
                    : p.hue === 2
                    ? "radial-gradient(circle, oklch(0.98 0.04 220) 0%, oklch(0.84 0.15 230) 42%, oklch(0.6 0.2 258 / 55%) 72%, transparent 100%)"
                    : p.hue
                    ? "radial-gradient(circle, oklch(0.96 0.08 88) 0%, oklch(0.78 0.2 45) 42%, oklch(0.6 0.26 340 / 55%) 72%, transparent 100%)"
                    : "radial-gradient(circle, #ffffff 0%, #d6e8ff 45%, oklch(0.75 0.06 250 / 35%) 72%, transparent 100%)",
                  pointerEvents: "none",
                  willChange: "transform, opacity",
                }}
              />
            );
          })}

          {/* Antelope */}
          <div
            className="absolute"
            style={{
              left: `${(RUNNER_X / W) * 100}%`,
              bottom: `calc(${((H - GROUND_Y - GROUND_SINK) / H) * 100}% + ${(y / H) * 100}%)`,
              width: `${(RUNNER_W / W) * 100}%`,
              height: `${(RUNNER_H / H) * 100}%`,
              willChange: "transform",
            }}
          >
            <div
              className="relative h-full w-full"
              style={{
                transform: `rotate(${Math.max(-9, Math.min(9, -y * 0.05))}deg)`,
                filter: "drop-shadow(0 10px 14px oklch(0.12 0.05 285 / 55%))",
              }}
            >
              {FRAMES.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt={index === 0 ? "Antilope stylisée au galop" : ""}
                  aria-hidden={index !== 0}
                  className={`absolute inset-0 h-full w-full object-contain ${
                    index === frame ? "opacity-100" : "opacity-0"
                  }`}
                  loading="eager"
                  decoding="async"
                />
              ))}
            </div>
            {/* Dust puffs */}
            {phase === "running" && y < 2 && (
              <>
                <span className="animate-dust absolute -left-2 bottom-1 h-2.5 w-2.5 rounded-full bg-foreground/40" />
                <span
                  className="animate-dust absolute left-4 bottom-0 h-2 w-2 rounded-full bg-foreground/30"
                  style={{ animationDelay: "0.2s" }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. Hautes herbes de premier plan — devant l'antilope */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <ParallaxLayer
          src={grassFrontImg}
          scroll={scroll}
          k={0.0016}
          className="inset-x-0 bottom-0"
          style={{
            height: "17%",
            backgroundPosition: "bottom",
            filter: "saturate(1.1) brightness(0.95)",
          }}
        />
      </div>

      {/* HUD */}
      <header
        className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4"
        style={{ contain: "layout style" }}
      >
        <div className="hud-panel flex min-w-0 items-center gap-3 rounded-2xl px-3 py-2">
          <img
            src={f5}
            alt=""
            aria-hidden
            className="h-7 w-10 shrink-0 object-contain sm:h-9 sm:w-14"
          />
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Savanna Sprint
            </p>
            <p className="text-gradient-antelope truncate text-lg font-black leading-none sm:text-2xl">
              {String(score).padStart(5, "0")}
            </p>
          </div>
        </div>
        <div className="hud-panel flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2 text-right">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Record
            </p>
            <p className="text-lg font-black leading-none text-foreground sm:text-xl">
              {String(best).padStart(5, "0")}
            </p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Vitesse
            </p>
            <p className="text-lg font-black leading-none text-primary sm:text-xl">
              {Math.round(speed / 10)}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={muted ? "Activer la musique" : "Couper la musique"}
            className="pointer-events-auto h-8 w-8 shrink-0 rounded-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <audio ref={audioRef} src={musicAsset.url} loop preload="auto" />

      {/* Overlays */}
      {phase !== "running" && (
        <div
          className={`absolute inset-0 grid place-items-center px-6 ${
            phase === "idle" ? "bg-background/55 backdrop-blur-[2px]" : "bg-white"
          }`}
        >
          <div className="hud-panel max-w-md rounded-3xl px-6 py-5 text-center sm:px-10 sm:py-7">
            <h1 className="text-gradient-antelope text-2xl font-black tracking-tight sm:text-4xl">
              {phase === "idle"
                ? "Savanna Sprint"
                : phase === "won"
                ? "Ligne d'arrivée !"
                : "Course terminée"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Score {score} · Record {best}
            </p>
            <Button
              type="button"
              size="lg"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                start();
              }}
              className="mt-5 rounded-full px-7 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundImage: "var(--gradient-antelope)", boxShadow: "var(--shadow-glow)" }}
            >
              {phase === "idle" ? "Galoper" : phase === "won" ? "Recourir" : "Rejouer"}
            </Button>

            {phase !== "idle" && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    void shareScore();
                  }}
                  className="rounded-full border-primary bg-primary px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:scale-105 hover:bg-primary/90 active:scale-95"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager le score
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard?.writeText(`${shareText} ${shareUrl}`);
                  }}
                  className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-foreground underline-offset-4 hover:bg-secondary hover:underline"
                >
                  Copier
                </Button>
              </div>
            )}

          </div>
        </div>
      )}



    </div>
  );
}
