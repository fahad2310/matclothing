"use client";

import { Suspense } from "react";
import { AdaptiveDpr } from "@react-three/drei";
import { CanvasWrapper } from "./CanvasWrapper";
import { FloatingGeometry } from "./FloatingGeometry";

function HeroSceneContent() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#c9a84c" />

      <AdaptiveDpr pixelated />

      <fog attach="fog" args={["#0a0a0a", 5, 20]} />

      <Suspense fallback={null}>
        <FloatingGeometry />
      </Suspense>
    </>
  );
}

export function HeroScene({ className }: { className?: string }) {
  return (
    <CanvasWrapper
      className={className}
      camera={{ position: [0, 0, 6], fov: 50 }}
      minTier="medium"
      fallback={
        <div className="h-full w-full bg-gradient-to-b from-background via-background to-surface" />
      }
    >
      <HeroSceneContent />
    </CanvasWrapper>
  );
}
