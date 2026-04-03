"use client";

import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ModelLoaderProps {
  path: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
  rotateSpeed?: number;
  colorOverride?: string;
}

export function ModelLoader({
  path,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = false,
  rotateSpeed = 0.005,
  colorOverride,
}: ModelLoaderProps) {
  const { scene } = useGLTF(path);
  const groupRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid mutation issues
  const clonedScene = scene.clone(true);

  // Apply color override if provided
  useEffect(() => {
    if (!colorOverride || !groupRef.current) return;

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          mat.color.set(colorOverride);
          mat.needsUpdate = true;
        }
      }
    });
  }, [colorOverride]);

  useFrame(() => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += rotateSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}
