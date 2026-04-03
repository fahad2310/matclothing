"use client";

import {
  Environment as DreiEnvironment,
  ContactShadows,
} from "@react-three/drei";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

interface SceneEnvironmentProps {
  showShadows?: boolean;
}

export function SceneEnvironment({ showShadows = true }: SceneEnvironmentProps) {
  const { tier } = useDeviceCapability();

  return (
    <>
      <DreiEnvironment preset="city" />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow={tier === "high"}
        shadow-mapSize={tier === "high" ? 1024 : 512}
      />
      <directionalLight position={[-3, 3, -3]} intensity={0.3} />

      {showShadows && tier !== "low" && (
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
          resolution={tier === "high" ? 512 : 256}
        />
      )}
    </>
  );
}
