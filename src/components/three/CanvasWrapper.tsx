"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useDeviceCapability, type DeviceTier } from "@/hooks/useDeviceCapability";
import { cn } from "@/lib/utils";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false },
);

interface CanvasWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  minTier?: DeviceTier;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
  frameloop?: "always" | "demand" | "never";
  /** Enables shadow mapping. Needed for cast/receive shadows on light themes. */
  shadows?: boolean;
}

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <span className="text-xs tracking-wider text-muted">Loading 3D</span>
      </div>
    </div>
  );
}

export function CanvasWrapper({
  children,
  fallback,
  className,
  minTier = "medium",
  camera = { position: [0, 0, 5], fov: 45 },
  frameloop = "always",
  shadows = false,
}: CanvasWrapperProps) {
  const { tier, hasWebGL } = useDeviceCapability();

  const tierRank: Record<DeviceTier, number> = {
    low: 0,
    medium: 1,
    high: 2,
  };

  // Show fallback if device can't handle 3D
  if (!hasWebGL || tierRank[tier] < tierRank[minTier]) {
    return (
      <div className={cn("relative", className)}>
        {fallback || (
          <div className="flex h-full w-full items-center justify-center bg-surface">
            <span className="text-xs text-muted">
              3D not available on this device
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={camera}
          frameloop={frameloop}
          // "soft" maps to PCFSoftShadowMap, deprecated in three 0.183.
          shadows={shadows && tier === "high"}
          dpr={[1, tier === "high" ? 2 : 1.5]}
          gl={{
            antialias: tier === "high",
            alpha: true,
            powerPreference: tier === "high" ? "high-performance" : "default",
          }}
          style={{ width: "100%", height: "100%" }}
        >
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}
