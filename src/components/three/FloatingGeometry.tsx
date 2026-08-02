"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A still-life of matte objects, not a light show.
 *
 * The dark theme used emissive wireframes and additive-blended particles —
 * effects that only exist as light against black. On paper there is no light
 * to add, so form is carried by material and shadow instead: unpolished
 * stone-coloured primitives drifting slowly enough to read as sculpture.
 *
 * Offsets are index-derived rather than random so the composition is stable
 * across renders and identical on server and client.
 */

const STONE = "#e8e2d8";
const TAUPE = "#8a7b68";
const PAPER = "#f2eee7";

interface StudyObjectProps {
  position: [number, number, number];
  scale: number;
  /** Drift period in seconds. Slow — these settle, they don't bob. */
  period: number;
  seed: number;
  color: string;
  geometry: React.ReactNode;
}

function StudyObject({
  position,
  scale,
  period,
  seed,
  color,
  geometry,
}: StudyObjectProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // ~40% slower than the dark theme, and a shallower travel.
    ref.current.position.y = position[1] + Math.sin(t / period + seed) * 0.18;
    ref.current.rotation.y = t * 0.06 + seed;
    ref.current.rotation.x = Math.sin(t * 0.04 + seed) * 0.12;
  });

  return (
    <mesh ref={ref} position={position} scale={scale} castShadow receiveShadow>
      {geometry}
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
    </mesh>
  );
}

export function FloatingGeometry() {
  return (
    <>
      {/*
       * Anchor form. Kept on nearly the same depth plane as the supporting
       * objects — pushing it forward made perspective inflate it until it
       * swallowed the composition.
       */}
      <StudyObject
        position={[0, 0.05, -0.7]}
        scale={0.92}
        period={7}
        seed={0}
        color={STONE}
        geometry={<sphereGeometry args={[1, 64, 64]} />}
      />

      {/*
       * Supporting forms. Held inside x ±1.45 — the hero frame is a tall,
       * narrow column, so its horizontal field of view is much smaller than
       * the camera distance suggests and anything wider gets cropped.
       */}
      <StudyObject
        position={[-1.3, 0.72, -1.5]}
        scale={0.36}
        period={9}
        seed={1.2}
        color={TAUPE}
        geometry={<torusGeometry args={[1, 0.28, 32, 96]} />}
      />
      <StudyObject
        position={[1.28, -0.72, -1.3]}
        scale={0.4}
        period={11}
        seed={2.4}
        color={PAPER}
        geometry={<cylinderGeometry args={[0.7, 0.7, 1.5, 64]} />}
      />
      <StudyObject
        position={[1.12, 1.05, -1.9]}
        scale={0.25}
        period={8}
        seed={3.6}
        color={TAUPE}
        geometry={<icosahedronGeometry args={[1, 0]} />}
      />
      <StudyObject
        position={[-1.05, -1.1, -1.7]}
        scale={0.28}
        period={10}
        seed={4.8}
        color={STONE}
        geometry={<boxGeometry args={[1.3, 1.3, 1.3]} />}
      />
    </>
  );
}
