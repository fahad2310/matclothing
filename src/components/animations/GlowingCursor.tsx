"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function GlowingCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    }
    function onLeave() {
      setVisible(false);
    }

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed z-[9998] h-[300px] w-[300px] rounded-full"
      animate={{
        x: pos.x - 150,
        y: pos.y - 150,
        opacity: visible ? 1 : 0,
      }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
      style={{
        background:
          "radial-gradient(circle, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.02) 40%, transparent 70%)",
      }}
    />
  );
}
