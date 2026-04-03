"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  images: string[];
  alt: string;
  category?: string;
}

export function ImageViewer({ images, alt, category }: ImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex];
  const hasImages = images.length > 0 && images[0];

  function handleMouseMove(e: React.MouseEvent) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Tilt effect (±12deg)
    setTilt({
      x: (y - 0.5) * -12,
      y: (x - 0.5) * 12,
    });

    // Zoom position
    setZoomPos({ x: x * 100, y: y * 100 });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setZoomed(false);
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setZoomed(!zoomed)}
        className="relative aspect-square overflow-hidden bg-surface cursor-zoom-in"
        style={{ perspective: "1000px" }}
      >
        {hasImages ? (
          <motion.div
            className="h-full w-full"
            animate={{
              rotateX: tilt.x,
              rotateY: tilt.y,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative h-full w-full"
              >
                <Image
                  src={activeImage}
                  alt={alt}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-500",
                    zoomed && "scale-[2]",
                  )}
                  style={
                    zoomed
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        }
                      : undefined
                  }
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Shine / glare effect on tilt */}
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background: `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 + tilt.x * -3}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
              }}
            />
          </motion.div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-surface-2">
            <span className="text-8xl opacity-20">
              {category === "shoes"
                ? "👟"
                : category === "watches"
                  ? "⌚"
                  : "👕"}
            </span>
          </div>
        )}

        {/* Zoom hint */}
        {hasImages && !zoomed && (
          <div className="absolute bottom-3 right-3 z-10 text-[10px] tracking-wider text-muted/50 pointer-events-none">
            Hover to tilt &middot; Click to zoom
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-16 w-16 overflow-hidden border transition-all",
                i === activeIndex
                  ? "border-accent"
                  : "border-border hover:border-muted",
              )}
            >
              <Image
                src={img}
                alt={`${alt} view ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
