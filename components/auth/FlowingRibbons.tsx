"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * FlowingRibbons — Abstract, flowing line-art animation for the auth branding panel.
 *
 * Renders multiple thin, elegant cubic-bezier curves that enter from the upper-left
 * and sweep diagonally down toward the lower-right, creating a graceful ribbon-like
 * composition. Uses requestAnimationFrame for seamless, smooth, periodic motion.
 *
 * Respects `prefers-reduced-motion` by rendering a static snapshot.
 */

const LINE_COUNT = 11;

interface RibbonLine {
  baseD: string;
  opacity: number;
  strokeWidth: number;
  phaseOffset: number;
}

/** Generate SVG path data for a single ribbon line at a given animation time. */
function buildRibbonPath(index: number, total: number, time: number): string {
  const t = index / (total - 1); // 0 → 1
  const spread = 32;

  // Phase offset per line for organic staggering
  const phase = index * 0.7 + time;

  // Start point: left edge, upper-to-mid portion
  const startY = 10 + t * spread + Math.sin(phase * 0.4) * 3;

  // First control point
  const cp1x = 20 + t * 5 + Math.sin(phase * 0.3 + 1) * 2;
  const cp1y = 18 + t * spread * 0.65 + Math.sin(phase * 0.5 + 2) * 4;

  // Second control point
  const cp2x = 52 + t * 8 + Math.sin(phase * 0.35 + 3) * 3;
  const cp2y = 42 + t * spread * 0.85 + Math.sin(phase * 0.45 + 1.5) * 5;

  // End point: right edge, lower area
  const endX = 108;
  const endY = 58 + t * spread * 1.05 + Math.sin(phase * 0.3 + 4) * 3;

  return `M -5 ${startY.toFixed(2)} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${endX} ${endY.toFixed(2)}`;
}

function buildStaticRibbonPath(index: number, total: number): string {
  return buildRibbonPath(index, total, 0);
}

function getLineProps(index: number, total: number): Omit<RibbonLine, "baseD"> {
  const t = index / (total - 1);
  const distFromCenter = Math.abs(t - 0.5) * 2;
  return {
    opacity: 0.14 - distFromCenter * 0.08,
    strokeWidth: 0.3 + (1 - distFromCenter) * 0.2,
    phaseOffset: index * 0.7,
  };
}

export function FlowingRibbons() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Animation loop
  useEffect(() => {
    if (reducedMotion) return;

    let frameId: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      // Slow time progression for gentle, periodic motion
      const elapsed = (timestamp - startTime) / 1000;
      const time = elapsed * 0.15; // Very slow evolution

      pathRefs.current.forEach((path, i) => {
        if (path) {
          path.setAttribute("d", buildRibbonPath(i, LINE_COUNT, time));
        }
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion]);

  const lineProps = Array.from({ length: LINE_COUNT }, (_, i) => ({
    ...getLineProps(i, LINE_COUNT),
    staticPath: buildStaticRibbonPath(i, LINE_COUNT),
  }));

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        {lineProps.map((line, i) => (
          <path
            key={i}
            ref={(el) => { pathRefs.current[i] = el; }}
            d={line.staticPath}
            stroke="rgba(255, 255, 255, 1)"
            strokeOpacity={line.opacity}
            strokeWidth={line.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}
