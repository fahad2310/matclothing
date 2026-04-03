"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { HeroScene } from "@/components/three/HeroScene";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
      {/* 3D Background Scene */}
      <div className="absolute inset-0">
        <HeroScene className="h-full w-full" />
      </div>

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/80" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 h-[400px] w-[400px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.12), transparent)" }}
        animate={{ x: [0, 60, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 h-[350px] w-[350px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.08), transparent)" }}
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6"
        >
          <span className="inline-block border border-accent/30 bg-accent/5 px-4 py-1.5 text-[10px] tracking-[0.5em] uppercase text-accent backdrop-blur-sm">
            Premium Collection 2026
          </span>
        </motion.div>

        {/* Animated gradient title */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-7xl font-bold tracking-[0.2em] md:text-[9rem] lg:text-[12rem] leading-none"
          style={{
            background: "linear-gradient(135deg, #f5f5f5 0%, #c9a84c 50%, #f5f5f5 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradient-shift 6s ease infinite",
          }}
        >
          MAT
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-2 flex items-center justify-center gap-4"
        >
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-accent/50" />
          <p className="text-sm tracking-[0.3em] text-muted md:text-base">
            CLOTHING &middot; WATCHES &middot; SHOES
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-accent/50" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted/70"
        >
          Elevate your style with handpicked premium fashion.
          Crafted for those who dare to stand out.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <MagneticButton>
            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-2 overflow-hidden bg-accent px-10 py-3.5 text-sm tracking-[0.2em] uppercase text-background transition-all"
            >
              <span className="relative z-10">Shop Now</span>
              <svg className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <div className="absolute inset-0 bg-accent-hover translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-border/50 px-10 py-3.5 text-sm tracking-[0.2em] uppercase text-foreground/80 backdrop-blur-sm transition-all hover:border-accent hover:text-accent"
            >
              Contact Us
            </Link>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted/50">
            Scroll
          </span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="text-muted/30">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
            <motion.circle
              cx="8" cy="8" r="2" fill="currentColor"
              animate={{ cy: [8, 16, 8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
