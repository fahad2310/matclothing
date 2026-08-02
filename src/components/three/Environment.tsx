"use client";

import {
  Environment as DreiEnvironment,
  ContactShadows,
} from "@react-three/drei";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

interface SceneEnvironmentProps {
  showShadows?: boolean;
}

/**
 * Shared product lighting. "studio" over "city" — city reflections throw
 * colour casts that read as dirt on a warm paper background.
 */
export function SceneEnvironment({ showShadows = true }: SceneEnvironmentProps) {
  const { tier } = useDeviceCapability();

  return (
    <>
      <DreiEnvironment preset="studio" environmentIntensity={0.55} />

      <ambientLight intensity={0.7} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.4}
        castShadow={tier === "high"}
        shadow-mapSize={tier === "high" ? 1024 : 512}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#f2eee7" />

      {showShadows && tier !== "low" && (
        <ContactShadows
          position={[0, -1.5, 0]}
          // 0.4 was tuned against black. On paper that reads as a smudge.
          opacity={0.22}
          scale={10}
          blur={2.6}
          far={4}
          resolution={tier === "high" ? 512 : 256}
          color="#14110e"
        />
      )}
    </>
  );
}
