"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GhostTrail {
  id: string;
  points: { x: number; y: number }[];
}

export const GhostLayer = () => {
  const [ghosts, setGhosts] = useState<GhostTrail[]>([]);

  const generateRandomPath = () => {
    const points = [];
    const startX = typeof window !== "undefined" ? Math.random() * window.innerWidth : 0;
    const startY = typeof window !== "undefined" ? Math.random() * window.innerHeight : 0;
    for (let i = 0; i < 20; i++) {
      points.push({
        x: startX + (Math.random() - 0.5) * 200,
        y: startY + (Math.random() - 0.5) * 200,
      });
    }
    return points;
  };

  useEffect(() => {
    const savedPath = localStorage.getItem("ghost_last_path");
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newGhost: GhostTrail = {
          id: Math.random().toString(),
          points: savedPath ? JSON.parse(savedPath) : generateRandomPath(),
        };
        setGhosts(prev => [...prev, newGhost]);
        
        setTimeout(() => {
          setGhosts(prev => prev.filter(g => g.id !== newGhost.id));
        }, 5000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      {ghosts.map((ghost) => (
        <GhostCursor key={ghost.id} trail={ghost.points} />
      ))}
    </div>
  );
};

const GhostCursor = ({ trail }: { trail: { x: number; y: number }[] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: trail[0].x, y: trail[0].y }}
      animate={{
        opacity: [0, 0.2, 0.2, 0],
        x: trail.map(p => p.x),
        y: trail.map(p => p.y),
      }}
      transition={{
        duration: 5,
        ease: "linear",
        times: [0, 0.1, 0.9, 1],
      }}
      className="absolute w-2 h-2 rounded-full bg-white/40 blur-[2px]"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/20 rounded-full animate-ping" />
    </motion.div>
  );
};
