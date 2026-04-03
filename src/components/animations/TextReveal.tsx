"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TextRevealProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  stagger?: number;
  splitBy?: "words" | "chars";
}

export function TextReveal({
  children,
  className,
  as: Tag = "h2",
  delay = 0,
  stagger = 0.04,
  splitBy = "words",
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const spans = el.querySelectorAll(".text-reveal-item");

    gsap.fromTo(
      spans,
      { y: "100%", opacity: 0 },
      {
        y: "0%",
        opacity: 1,
        duration: 0.6,
        stagger,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [delay, stagger]);

  const items =
    splitBy === "words" ? children.split(" ") : children.split("");

  return (
    <Tag ref={containerRef as React.RefObject<HTMLHeadingElement>} className={cn("overflow-hidden", className)}>
      {items.map((item, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span className="text-reveal-item inline-block opacity-0">
            {item}
            {splitBy === "words" && i < items.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
