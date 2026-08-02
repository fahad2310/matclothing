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
        <div className="h-6 w-6 animate-spin rounded-full border border-accent-soft border-t-transparent" />
        <span className="spec-label">{progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
}

/**
 * Stand-in shown until a product has a real model. Matte and solid, not a
 * gold wireframe — a wireframe on paper reads as unfinished scaffolding
 * rather than as a placeholder.
 */
function PlaceholderGeometry({ category }: { category?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      ref={meshRef}
      castShadow
      receiveShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {category === "watches" ? (
        <torusGeometry args={[1, 0.3, 32, 96]} />
      ) : category === "shoes" ? (
        <boxGeometry args={[1.5, 0.6, 2]} />
      ) : (
        <boxGeometry args={[1.2, 1.6, 0.3]} />
      )}
      <meshStandardMaterial
        color={hovered ? "#8a7b68" : "#e8e2d8"}
        roughness={0.85}
        metalness={0}
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
        autoRotateSpeed={0.8}
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
    <div className="flex h-full w-full items-center justify-center bg-surface">
      <span className="spec-label">No 3D view for this piece</span>
    </div>
  );

  return (
    <CanvasWrapper
      className={cn("aspect-square w-full", className)}
      fallback={fallback || defaultFallback}
      camera={{ position: [0, 0, 4], fov: 45 }}
      minTier="medium"
      shadows
    >
      <ProductScene
        modelPath={modelPath}
        colorHex={colorHex}
        category={category}
      />
    </CanvasWrapper>
  );
}
