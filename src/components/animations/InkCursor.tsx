"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor trail, rebuilt for paper.
 *
 * The dark theme had gold sparkles with additive blending — light added to
 * black. Paper has no light to add, so the same gesture is made with the
 * opposite material: fine graphite specks that fall, fade and settle.
 *
 * The lagging ring that used to follow the pointer is gone. It read as a
 * widget chasing the mouse rather than as ink, and the system cursor is
 * left visible so nothing feels laggy or lost.
 *
 * One canvas and one rAF loop. Pointer state lives in refs so moving the
 * mouse never triggers a React render.
 */

interface Speck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  tone: string;
}

// Ink through taupe. No pure black — it reads as dirt on warm stock.
const TONES = ["#14110e", "#3a332b", "#6e6153", "#8a7b68"];

export function InkCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pointer = useRef({ x: -100, y: -100 });
  const specks = useRef<Speck[]>([]);
  const lastEmit = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Touch devices have no hover, and a trail chasing taps looks broken.
    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    function emit(x: number, y: number, count: number) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.25 + Math.random() * 0.9;
        specks.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.35,
          size: 0.6 + Math.random() * 1.7,
          life: 0,
          maxLife: 34 + Math.random() * 40,
          tone: TONES[Math.floor(Math.random() * TONES.length)],
        });
      }
      // Cap the pool so a fast scribble cannot run the frame budget away.
      if (specks.current.length > 220) {
        specks.current.splice(0, specks.current.length - 220);
      }
    }

    function onMove(e: PointerEvent) {
      pointer.current = { x: e.clientX, y: e.clientY };

      const dx = e.clientX - lastEmit.current.x;
      const dy = e.clientY - lastEmit.current.y;
      const travelled = Math.hypot(dx, dy);

      // Emit by distance, not by event — otherwise a high-polling mouse
      // produces a dense clot and a slow one produces nothing.
      if (travelled > 9) {
        emit(e.clientX, e.clientY, travelled > 45 ? 3 : 1);
        lastEmit.current = { x: e.clientX, y: e.clientY };
      }
    }

    function frame() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      specks.current = specks.current.filter((s) => {
        s.life += 1;
        if (s.life >= s.maxLife) return false;

        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.022; // settle downward, like dust
        s.vx *= 0.985;

        const t = s.life / s.maxLife;
        ctx.globalAlpha = (1 - t) * 0.5;
        ctx.fillStyle = s.tone;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 - t * 0.45), 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9998]">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
