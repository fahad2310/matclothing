/* eslint-disable react-hooks/purity */
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingRing({ position, scale, speed, color }: {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.4;
    ref.current.rotation.x = t * 0.2 + offset;
    ref.current.rotation.z = t * 0.15;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[1, 0.02, 16, 64]} />
      <meshStandardMaterial
        color={color}
        metalness={1}
        roughness={0.1}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function FloatingDiamond({ position, scale, speed }: {
  position: [number, number, number];
  scale: number;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.3;
    ref.current.rotation.y = t * 0.5;
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.2;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#c9a84c"
        metalness={0.95}
        roughness={0.05}
        transparent
        opacity={0.4}
        wireframe
      />
    </mesh>
  );
}

function CentralSphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.1;
    ref.current.rotation.x = Math.sin(t * 0.05) * 0.2;
    const s = 1 + Math.sin(t * 0.5) * 0.05;
    ref.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.8, 1]} />
      <meshStandardMaterial
        color="#c9a84c"
        metalness={1}
        roughness={0}
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

function Particles({ count = 200 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Distribute in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 12;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      siz[i] = Math.random() * 2 + 0.5;
    }
    return { positions: pos, sizes: siz };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.getElapsedTime() * 0.015;
    points.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.05;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        color="#c9a84c"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function OrbitingLight() {
  const ref = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = Math.cos(t * 0.3) * 5;
    ref.current.position.z = Math.sin(t * 0.3) * 5;
    ref.current.position.y = Math.sin(t * 0.5) * 2;
  });

  return <pointLight ref={ref} color="#c9a84c" intensity={2} distance={15} />;
}

export function FloatingGeometry() {
  return (
    <>
      <CentralSphere />

      {/* Floating rings at various positions */}
      <FloatingRing position={[-3, 1.5, -2]} scale={0.6} speed={0.7} color="#c9a84c" />
      <FloatingRing position={[3.5, -1, -1]} scale={0.4} speed={0.5} color="#e8d5a3" />
      <FloatingRing position={[-2, -1.5, -3]} scale={0.3} speed={0.9} color="#c9a84c" />
      <FloatingRing position={[2, 2, -4]} scale={0.5} speed={0.6} color="#d4b85c" />

      {/* Floating diamonds */}
      <FloatingDiamond position={[4, 0.5, -2]} scale={0.25} speed={0.8} />
      <FloatingDiamond position={[-4, -0.5, -3]} scale={0.2} speed={0.6} />
      <FloatingDiamond position={[1, 2.5, -5]} scale={0.15} speed={1} />
      <FloatingDiamond position={[-1.5, -2, -1]} scale={0.3} speed={0.4} />

      <Particles count={250} />
      <OrbitingLight />
    </>
  );
}
