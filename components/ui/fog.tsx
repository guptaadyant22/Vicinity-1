"use client";


// Animated fog background effect with edge gradients and subtle drifting motion.
// Adapts colors and opacity for dark and light themes to create depth on page backgrounds.

import * as React from "react";
import { useTheme } from "@/context/ThemeContext";


export interface FogBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  darkColor?: string;
  opacity?: number;
  speed?: number;
}


// Helper to join class names, filtering out falsy values
function joinClasses(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}


// Animated fog effect with edge gradients and theme-aware colors
export function FogBackground({
  className,
  children,
  color = "#60a5fa",
  darkColor = "#2563eb",
  opacity = 0.08,
  speed = 1,
}: FogBackgroundProps) {
  const { isDark } = useTheme();


  const duration1 = 60 / speed;
  const duration2 = 80 / speed;
  const duration3 = 100 / speed;


  const fogOpacity = isDark ? opacity * 0.4 : opacity;

  const fogColor = isDark ? darkColor : color;


  const baseBackground = isDark
    ? `
      radial-gradient(circle at center,
        #0f172a 0%,
        #0b1530 35%,
        #0a1738 58%,
        #102c5c 82%,
        #1d4ed8 100%)
    `
    : `
      radial-gradient(circle at center,
        #ffffff 0%,
        #ffffff 34%,
        #f8fbff 52%,
        #eef6ff 68%,
        #dbeafe 84%,
        #bfdbfe 100%)
    `;

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
      <div className="absolute inset-0" style={{ filter: "blur(90px)" }}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 90% 20% at 50% 0%, ${fogColor}, transparent 72%)`,
            opacity: fogOpacity * 0.22,
            animation: `fogDrift1 ${duration3}s ease-in-out infinite`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 22% 85% at 0% 50%, ${fogColor}, transparent 72%)`,
            opacity: fogOpacity * 0.18,
            animation: `fogDrift2 ${duration2}s ease-in-out infinite`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 22% 85% at 100% 50%, ${fogColor}, transparent 72%)`,
            opacity: fogOpacity * 0.18,
            animation: `fogDrift3 ${duration1}s ease-in-out infinite`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 90% 22% at 50% 100%, ${fogColor}, transparent 72%)`,
            opacity: fogOpacity * 0.2,
            animation: `fogDrift2 ${duration2 + 10}s ease-in-out infinite`,
          }}
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          filter: "blur(120px)",
          background: isDark
            ? `
              radial-gradient(circle at 0% 0%, rgba(37,99,235,0.04), transparent 26%),
              radial-gradient(circle at 100% 0%, rgba(37,99,235,0.04), transparent 26%),
              radial-gradient(circle at 0% 100%, rgba(37,99,235,0.04), transparent 26%),
              radial-gradient(circle at 100% 100%, rgba(37,99,235,0.04), transparent 26%)
            `
            : `
              radial-gradient(circle at 0% 0%, rgba(96,165,250,0.08), transparent 24%),
              radial-gradient(circle at 100% 0%, rgba(96,165,250,0.08), transparent 24%),
              radial-gradient(circle at 0% 100%, rgba(96,165,250,0.08), transparent 24%),
              radial-gradient(circle at 100% 100%, rgba(96,165,250,0.08), transparent 24%)
            `,
          opacity: 1,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.018) 32%, rgba(255,255,255,0) 62%)"
            : "radial-gradient(circle at center, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.38) 30%, rgba(255,255,255,0) 58%)",
        }}
      />

      {children ? (
        <div className="relative z-10 h-full w-full pointer-events-auto">
          {children}
        </div>
      ) : null}

      <style jsx>{`
        @keyframes fogDrift1 {
          0%,
          100% {
            transform: translateY(-1.5%) scale(1);
          }
          50% {
            transform: translateY(1.5%) scale(1.02);
          }
        }

        @keyframes fogDrift2 {
          0%,
          100% {
            transform: translateX(-1.5%) scale(1);
          }
          50% {
            transform: translateX(1.5%) scale(1.02);
          }
        }

        @keyframes fogDrift3 {
          0%,
          100% {
            transform: translateX(1.5%) scale(1);
          }
          50% {
            transform: translateX(-1.5%) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}
