"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ImageRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Direction the covering panel retreats towards. */
  from?: "bottom" | "left";
  delay?: number;
}

/**
 * Wipes a panel off an image as it enters the viewport.
 *
 * On the dark theme, drama came from luminance — things glowed into view.
 * Paper has no luminance to spend, so the equivalent gesture is
 * concealment and reveal: the image is uncovered like a plate in a
 * lookbook. The panel is paper-coloured, so it reads as the page pulling
 * back rather than as a shape sliding across.
 */
export function ImageReveal({
  children,
  className,
  from = "bottom",
  delay = 0,
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const panel = panelRef.current;
    if (!el || !panel) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(panel, { autoAlpha: 0 });
      gsap.set(el.firstElementChild, { scale: 1 });
      return;
    }

    const axis = from === "bottom" ? "yPercent" : "xPercent";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
        delay,
      });

      // Panel retreats, and the image settles out of a slight overscale
      // behind it — the two together read as a single considered motion.
      tl.to(panel, {
        [axis]: from === "bottom" ? -101 : 101,
        duration: 1.1,
        ease: "power3.inOut",
      }).from(
        el.firstElementChild,
        { scale: 1.12, duration: 1.4, ease: "power3.out" },
        "<",
      );
    }, el);

    return () => ctx.revert();
  }, [from, delay]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {children}
      <div
        ref={panelRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-background"
      />
    </div>
  );
}
