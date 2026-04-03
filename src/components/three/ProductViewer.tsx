"use client";

import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls, useProgress, Html, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { CanvasWrapper } from "./CanvasWrapper";
import { SceneEnvironment } from "./Environment";
import { ModelLoader } from "./ModelLoader";
import { cn } from "@/lib/utils";

interface ProductViewerProps {
  modelPath?: string;
  colorHex?: string;
  fallback?: React.ReactNode;
  className?: string;
  category?: string;
}

function LoadingProgress() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9a84c] border-t-transparent" />
        <span className="text-xs text-[#888] font-mono">
          {progress.toFixed(0)}%
        </span>
      </div>
    </Html>
  );
}

function PlaceholderGeometry({ category }: { category?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Rotate slowly
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {category === "watches" ? (
        <torusGeometry args={[1, 0.3, 16, 32]} />
      ) : category === "shoes" ? (
        <boxGeometry args={[1.5, 0.6, 2]} />
      ) : (
        <boxGeometry args={[1.2, 1.6, 0.3]} />
      )}
      <meshStandardMaterial
        color={hovered ? "#c9a84c" : "#2a2a2a"}
        metalness={0.8}
        roughness={0.2}
        wireframe
      />
    </mesh>
  );
}

function ProductScene({
  modelPath,
  colorHex,
  category,
}: {
  modelPath?: string;
  colorHex?: string;
  category?: string;
}) {
  return (
    <>
      <SceneEnvironment />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={1.5}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_ROTATE,
        }}
      />

      <Suspense fallback={<LoadingProgress />}>
        {modelPath ? (
          <ModelLoader
            path={modelPath}
            autoRotate={false}
            colorOverride={colorHex}
          />
        ) : (
          <PlaceholderGeometry category={category} />
        )}
      </Suspense>
    </>
  );
}

export function ProductViewer({
  modelPath,
  colorHex,
  fallback,
  className,
  category,
}: ProductViewerProps) {
  const defaultFallback = (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-surface-2">
      <span className="text-8xl opacity-20">
        {category === "shoes" ? "👟" : category === "watches" ? "⌚" : "👕"}
      </span>
    </div>
  );

  return (
    <CanvasWrapper
      className={cn("aspect-square w-full", className)}
      fallback={fallback || defaultFallback}
      camera={{ position: [0, 0, 4], fov: 45 }}
      minTier="medium"
    >
      <ProductScene
        modelPath={modelPath}
        colorHex={colorHex}
        category={category}
      />
    </CanvasWrapper>
  );
}
