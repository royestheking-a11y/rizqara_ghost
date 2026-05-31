"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";

interface BehaviorState {
  isReturning: boolean;
  totalVisits: number;
  lastVisit: string | null;
  currentSession: {
    startTime: number;
    mousePath: { x: number; y: number; t: number }[];
    clicks: number;
    scrollDepth: number;
    idleTime: number;
    prediction: string | null;
    metrics: {
      confidence: number;
      focus: number;
    };
  };
}

interface BehaviorContextType {
  state: BehaviorState;
  setPrediction: (p: string | null) => void;
}

const BehaviorContext = createContext<BehaviorContextType | undefined>(undefined);

export const BehaviorProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<BehaviorState>(() => {
    // Initial default state
    const defaultState = {
      isReturning: false,
      totalVisits: 1,
      lastVisit: null,
      currentSession: {
        startTime: Date.now(),
        mousePath: [],
        clicks: 0,
        scrollDepth: 0,
        idleTime: 0,
        prediction: null,
        metrics: {
          confidence: 100,
          focus: 50,
        },
      },
    };

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ghost_internet_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultState,
          isReturning: true,
          totalVisits: parsed.totalVisits + 1,
          lastVisit: parsed.lastVisit,
        };
      }
    }
    return defaultState;
  });

  const lastMouseMove = useRef<number>(Date.now());
  const mousePathRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const clicksRef = useRef<number>(0);
  const scrollRef = useRef<number>(0);

  const setPrediction = (p: string | null) => {
    setState((s) => ({
      ...s,
      currentSession: { ...s.currentSession, prediction: p },
    }));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ghost_internet_user");
      localStorage.setItem(
        "ghost_internet_user",
        JSON.stringify({
          totalVisits: stored ? JSON.parse(stored).totalVisits + 1 : 1,
          lastVisit: new Date().toISOString(),
        })
      );
    }

    // 2. Track Mouse Movement
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const point = { x: e.clientX, y: e.clientY, t: now };
      mousePathRef.current.push(point);
      
      if (mousePathRef.current.length > 500) mousePathRef.current.shift();

      // Check for rapid movement (frustration)
      const lastPoint = mousePathRef.current[mousePathRef.current.length - 2];
      if (lastPoint) {
        const dx = e.clientX - lastPoint.x;
        const dy = e.clientY - lastPoint.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 100) {
           setPrediction("You're becoming impatient.");
        }
      }

      lastMouseMove.current = now;

      // Rule-based Prediction (Phase 3)
      if (e.clientY < 50 && clicksRef.current >= 1) {
        setPrediction("You're considering leaving.");
      }
    };

    const handleClick = () => {
      clicksRef.current += 1;
      setState((s) => ({
        ...s,
        currentSession: { ...s.currentSession, clicks: clicksRef.current },
      }));
    };

    const handleScroll = () => {
      const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      scrollRef.current = depth;
      setState((s) => ({
        ...s,
        currentSession: { ...s.currentSession, scrollDepth: depth },
      }));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll);

    // Save path for "Ghost" replay
    const savePath = () => {
      if (mousePathRef.current.length > 50) {
        localStorage.setItem("ghost_last_path", JSON.stringify(mousePathRef.current.slice(-100)));
      }
    };

    window.addEventListener("pagehide", savePath);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") savePath();
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", savePath);
    };
  }, []);

  // Sync mouse path to state occasionally and update complex metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setState(s => {
        // Calculate new metrics
        const lastPoints = mousePathRef.current.slice(-10);
        let velocitySum = 0;
        if (lastPoints.length > 1) {
          for (let i = 1; i < lastPoints.length; i++) {
            const dx = lastPoints[i].x - lastPoints[i-1].x;
            const dy = lastPoints[i].y - lastPoints[i-1].y;
            velocitySum += Math.sqrt(dx*dx + dy*dy);
          }
        }
        
        const avgVelocity = velocitySum / Math.max(1, lastPoints.length);
        const newConfidence = Math.max(0, Math.min(100, s.currentSession.metrics.confidence + (avgVelocity > 50 ? -2 : 0.5)));
        const newFocus = Math.max(0, Math.min(100, s.currentSession.metrics.focus + (scrollRef.current > 0 ? 0.2 : -0.1)));

        return {
          ...s,
          currentSession: {
            ...s.currentSession,
            mousePath: [...mousePathRef.current],
            metrics: {
              confidence: Math.round(newConfidence),
              focus: Math.round(newFocus),
            }
          }
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BehaviorContext.Provider value={{ state, setPrediction }}>
      {children}
    </BehaviorContext.Provider>
  );
};

export const useBehavior = () => {
  const context = useContext(BehaviorContext);
  if (!context) throw new Error("useBehavior must be used within BehaviorProvider");
  return context;
};
