import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense } from "react";
import { Environment } from "@react-three/drei";
import { EffectComposer, DepthOfField, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Model } from "./Model";
import { useIsMobile } from "@/hooks/use-mobile";


// Loading state is now handled outside the Canvas via <LoadingOverlay />.


/**
 * Moves the camera based on window scroll to create a cinematic reveal.
 */
/**
 * Smoothly interpolates the camera between a cinematic start and end pose
 * based on page scroll. Keeps the gazelle centered at all times.
 */
function ScrollCamera() {
  const target = new THREE.Vector3(0, 0.5, 0);
  const desired = new THREE.Vector3();

  // Orbit configuration
  const radius = 3.0;
  const startAngle = (25 * Math.PI) / 180; // slight 3/4 front
  const totalSweep = (90 * Math.PI) / 180; // 90° horizontal rotation
  const startY = 0.75; // slightly below head level (low-angle)
  const endY = 1.6;    // gentle rise

  // Smooth easing (easeInOutCubic) for dreamy, non game-like motion
  const ease = (x: number) =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  useFrame(({ camera }) => {
    // Camera animation is driven by the first 300vh of scroll only.
    // Beyond that, scroll reveals project sections while the gazelle
    // stays at its max rotation.
    const animationRange = Math.max(1, window.innerHeight * 3);
    const raw = Math.min(1, Math.max(0, window.scrollY / animationRange));
    const t = ease(raw);


    const angle = startAngle + totalSweep * t;
    desired.set(
      Math.sin(angle) * radius,
      startY + (endY - startY) * t,
      Math.cos(angle) * radius
    );

    // Subtle inertia — smaller factor = more lag/elegance
    camera.position.lerp(desired, 0.05);
    camera.lookAt(target);
  });
  return null;
}



/**
 * Fullscreen Three.js canvas with proper PBR rendering for GLB models.
 * - ACES Filmic tone mapping for natural color response
 * - sRGB output color space to preserve embedded material colors
 * - Lightweight HDRI environment for realistic reflections / lighting
 */
export function Scene() {
  const isMobile = useIsMobile();
  return (
    <Canvas
      camera={{ position: [Math.sin((25 * Math.PI) / 180) * 3.0, 0.75, Math.cos((25 * Math.PI) / 180) * 3.0], fov: 42 }}

      dpr={isMobile ? [1, 1.5] : [1, 2]}
      shadows={!isMobile}
      flat={false}
      gl={{
        antialias: !isMobile,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "high-performance",
      }}
      className="!fixed inset-0 !h-screen !w-screen"
    >
      <ScrollCamera />

      {/* Subtle fill so shadowed areas keep some detail without washing PBR out */}
      <ambientLight intensity={isMobile ? 0.35 : 0.15} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={2.0}
        castShadow={!isMobile}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Suspense fallback={null}>

        {/* Lightweight preset HDRI — main driver of PBR reflections & ambient color */}
        <Environment preset="city" />
        <Model url="/models/model.glb" scale={1} />

        {/* Cinematic post-processing — desktop only (très coûteux sur GPU mobile) */}
        {!isMobile && (
          <EffectComposer multisampling={4}>
            <DepthOfField
              focusDistance={0.012}
              focalLength={0.025}
              bokehScale={3}
              height={720}
            />
            <Bloom
              intensity={0.25}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.2}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.2} darkness={0.6} />
          </EffectComposer>
        )}
      </Suspense>

    </Canvas>
  );
}
