import { useGLTF, Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { AnimationMixer, type Group } from "three";
import { useEffect, useMemo, useRef } from "react";

interface ModelProps {
  url: string;
  scale?: number;
}

export function Model({ url, scale = 1 }: ModelProps) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);

  // One mixer per loaded scene
  const mixer = useMemo(() => new AnimationMixer(scene), [scene]);

  useEffect(() => {
    if (!animations.length) return;
    const actions = animations.map((clip) => mixer.clipAction(clip));
    actions.forEach((a) => a.reset().play());

    return () => {
      actions.forEach((a) => a.stop());
      mixer.stopAllAction();
      mixer.uncacheRoot(scene);
    };
  }, [animations, mixer, scene]);

  useFrame((_, delta) => {
    mixer.update(delta);
  });

  return (
    <Center>
      <group ref={group} scale={scale}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}
