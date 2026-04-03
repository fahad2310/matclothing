"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export function SparklesCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  const createParticle = useCallback(
    (x: number, y: number) => {
      const colors = ["#c9a84c", "#e8d5a3", "#ffffff", "#f5e6b8", "#d4b85c"];
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      return {
        x,
        y,
        size: Math.random() * 3 + 1,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 1,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 40 + 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      };
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let lastSpawn = 0;

    function onMouseMove(e: MouseEvent) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      const now = Date.now();
      if (now - lastSpawn > 30) {
        for (let i = 0; i < 2; i++) {
          particles.current.push(
            createParticle(
              e.clientX + (Math.random() - 0.5) * 10,
              e.clientY + (Math.random() - 0.5) * 10,
            ),
          );
        }
        lastSpawn = now;
      }
    }

    window.addEventListener("mousemove", onMouseMove);

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter((p) => {
        p.life++;
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.02; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) return false;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        // Draw sparkle star
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          ctx.moveTo(0, 0);
          ctx.lineTo(
            Math.cos(angle) * p.size * 2,
            Math.sin(angle) * p.size * 2,
          );
        }
        ctx.fill();

        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
