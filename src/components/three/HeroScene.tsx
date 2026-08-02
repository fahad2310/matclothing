"use client";

import { Suspense } from "react";
import { AdaptiveDpr, ContactShadows, Environment } from "@react-three/drei";
import { CanvasWrapper } from "./CanvasWrapper";
import { FloatingGeometry } from "./FloatingGeometry";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

/**
 * White-studio lighting. The dark scene lit objects from within — a gold
 * point light and dark fog doing the work. Here the room does it: a soft
 * key from above, a low fill to keep the shadow sides from going muddy,
 * and a grounded contact shadow so the objects sit on the paper instead
 * of floating in front of it.
 *
 * ContactShadows rather than AccumulativeShadows: the objects drift
 * continuously, and accumulated shadows assume a static scene.
 */
function HeroSceneContent() {
  const { tier } = useDeviceCapability();

  return (
    <>
      <Environment preset="studio" environmentIntensity={0.5} />

      <ambientLight intensity={0.75} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={1.5}
        castShadow={tier === "high"}
        shadow-mapSize={1024}
        shadow-bias={-0.0004}
      />
      {/* Low fill from the opposite side — keeps shadow sides warm, not grey */}
      <directionalLight position={[-4, 1, -2]} intensity={0.35} color="#f2eee7" />

      <AdaptiveDpr pixelated />

      <Suspense fallback={null}>
        <FloatingGeometry />
      </Suspense>

      {tier !== "low" && (
        <ContactShadows
          position={[0, -2.05, 0]}
          opacity={0.22}
          scale={12}
          blur={2.8}
          far={5}
          resolution={tier === "high" ? 512 : 256}
          color="#14110e"
        />
      )}
    </>
  );
}

export function HeroScene({ className }: { className?: string }) {
  return (
    <CanvasWrapper
      className={className}
      camera={{ position: [0, 0.25, 7.2], fov: 42 }}
      minTier="medium"
      shadows
      fallback={
        // Weak devices still get a composed plate, not an empty box.
        <div className="flex h-full w-full items-center justify-center bg-surface">
          <div className="h-32 w-32 rounded-full bg-surface-2" />
        </div>
      }
    >
      <HeroSceneContent />
    </CanvasWrapper>
  );
}
