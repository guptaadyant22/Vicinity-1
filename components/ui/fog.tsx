"use client";

import * as React from "react";
import { useTheme } from "@/context/ThemeContext";

// Props for the fog background
export interface FogBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  darkColor?: string;
  opacity?: number;
  speed?: number;
}

// Small helper for joining classes
function joinClasses(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

// Main fog background
export function FogBackground({
  className,
  children,
  color = "#3b82f6",
  darkColor = "#2563eb",
  opacity = 0.22,
  speed = 1,
}: FogBackgroundProps) {
  const { isDark } = useTheme();

  const duration1 = 60 / speed;
  const duration2 = 80 / speed;
  const duration3 = 100 / speed;

  const baseBackground = isDark
    ? "linear-gradient(to bottom, #06101f 0%, #0b1730 45%, #081224 100%)"
    : "radial-gradient(ellipse 85% 70% at 50% 50%, #ffffff 0%, #ffffff 34%, #f8fbff 52%, #dbeafe 72%, #93c5fd 88%, #60a5fa 100%)";

  const fogColor = isDark ? darkColor : color;

  return (
    <div
      className={joinClasses(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      style={{
        background: baseBackground,
      }}
    >
      {/* Fog layers */}
      <div className="absolute inset-0" style={{ filter: "blur(80px)" }}>
        {/* Back layer */}
        <div
          className="absolute h-[120%] w-[200%]"
          style={{
            background: `radial-gradient(ellipse 50% 40% at 25% 50%, ${fogColor}, transparent),
                         radial-gradient(ellipse 40% 50% at 75% 60%, ${fogColor}, transparent)`,
            opacity: opacity * 0.28,
            animation: `fogDrift1 ${duration3}s ease-in-out infinite`,
          }}
        />

        {/* Middle layer */}
        <div
          className="absolute h-[120%] w-[200%]"
          style={{
            background: `radial-gradient(ellipse 60% 35% at 30% 40%, ${fogColor}, transparent),
                         radial-gradient(ellipse 45% 45% at 70% 70%, ${fogColor}, transparent)`,
            opacity: opacity * 0.38,
            animation: `fogDrift2 ${duration2}s ease-in-out infinite`,
          }}
        />

        {/* Front layer */}
        <div
          className="absolute h-[120%] w-[200%]"
          style={{
            background: `radial-gradient(ellipse 55% 50% at 40% 55%, ${fogColor}, transparent),
                         radial-gradient(ellipse 50% 35% at 60% 35%, ${fogColor}, transparent)`,
            opacity: opacity * 0.32,
            animation: `fogDrift3 ${duration1}s ease-in-out infinite`,
          }}
        />
      </div>

      {/* Ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          filter: "blur(120px)",
          background: isDark
            ? "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(37,99,235,0.18), transparent)"
            : "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(96,165,250,0.18), transparent 70%)",
          opacity: 1,
        }}
      />

      {/* Surface wash */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0) 75%)"
            : "radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.22) 35%, rgba(255,255,255,0) 75%)",
        }}
      />

      {/* Optional child content */}
      {children ? (
        <div className="relative z-10 h-full w-full pointer-events-auto">
          {children}
        </div>
      ) : null}

      {/* Local keyframes */}
      <style jsx>{`
        @keyframes fogDrift1 {
          0%,
          100% {
            transform: translateX(-10%) translateY(0%);
          }
          50% {
            transform: translateX(5%) translateY(-3%);
          }
        }

        @keyframes fogDrift2 {
          0%,
          100% {
            transform: translateX(0%) translateY(-2%);
          }
          50% {
            transform: translateX(-15%) translateY(2%);
          }
        }

        @keyframes fogDrift3 {
          0%,
          100% {
            transform: translateX(-5%) translateY(2%);
          }
          50% {
            transform: translateX(10%) translateY(-2%);
          }
        }
      `}</style>
    </div>
  );
}
