"use client";

import React from "react";

/**
 * FlowingRibbons — Abstract, flowing line-art animation for the auth branding panel.
 *
 * Renders multiple thin, elegant cubic-bezier curves that enter from the left edge
 * and sweep diagonally down toward the lower-right area. Uses pure SVG and GPU-accelerated
 * CSS animations (combining `stroke-dashoffset` for longitudinal flow along the curves
 * and subtle transverse wave transformations).
 *
 * - Zero external animation libraries
 * - Mathematically seamless, periodic looping with zero jumps or resets
 * - Staggered durations, delays, and phases for a coordinated organic ribbon feel
 * - Strictly respects `prefers-reduced-motion`
 */

interface RibbonConfig {
  d: string;
  opacity: number;
  strokeWidth: number;
  dashArray: string;
  flowDuration: number;
  flowDelay: number;
  swayDuration: number;
  swayDelay: number;
  swayX: number;
  swayY: number;
}

const LINE_COUNT = 11;

function generateRibbonLines(): RibbonConfig[] {
  const lines: RibbonConfig[] = [];

  // Pre-configured dash patterns (each sum is exactly 1000 to match pathLength=1000)
  const dashPatterns = [
    "460 90 360 90",
    "520 70 340 70",
    "420 110 360 110",
    "540 60 340 60",
    "480 80 360 80",
    "560 60 320 60",
    "440 90 380 90",
    "510 80 330 80",
    "470 90 350 90",
    "530 70 330 70",
    "450 100 350 100",
  ];

  // Staggered timing configurations
  const timings = [
    { flowDuration: 14.0, flowDelay: 0.0, swayDuration: 9.0, swayDelay: 0.0, swayX: 14, swayY: -12 },
    { flowDuration: 17.0, flowDelay: -3.5, swayDuration: 11.0, swayDelay: -2.0, swayX: -10, swayY: 16 },
    { flowDuration: 13.0, flowDelay: -7.0, swayDuration: 8.5, swayDelay: -4.0, swayX: 16, swayY: 10 },
    { flowDuration: 19.0, flowDelay: -2.0, swayDuration: 12.0, swayDelay: -1.0, swayX: -12, swayY: -10 },
    { flowDuration: 15.0, flowDelay: -8.5, swayDuration: 10.0, swayDelay: -5.0, swayX: 12, swayY: 18 },
    { flowDuration: 13.5, flowDelay: -4.0, swayDuration: 9.5, swayDelay: -3.0, swayX: -15, swayY: 12 },
    { flowDuration: 18.0, flowDelay: -10.0, swayDuration: 11.5, swayDelay: -6.0, swayX: 18, swayY: -14 },
    { flowDuration: 16.0, flowDelay: -1.5, swayDuration: 8.0, swayDelay: -2.5, swayX: -12, swayY: -16 },
    { flowDuration: 14.5, flowDelay: -7.5, swayDuration: 10.5, swayDelay: -4.5, swayX: 15, swayY: 14 },
    { flowDuration: 20.0, flowDelay: -5.0, swayDuration: 12.5, swayDelay: -1.5, swayX: -14, swayY: 16 },
    { flowDuration: 15.5, flowDelay: -3.0, swayDuration: 9.0, swayDelay: -3.5, swayX: 12, swayY: -12 },
  ];

  for (let i = 0; i < LINE_COUNT; i++) {
    const t = i / (LINE_COUNT - 1); // 0 -> 1
    const distFromCenter = Math.abs(t - 0.5) * 2; // 0 at center, 1 at edges

    // Path geometry across 1200 x 1000 coordinate space
    const startY = 80 + t * 340;
    const cp1x = 260 + t * 70;
    const cp1y = 150 + t * 300;
    const cp2x = 680 + t * 90;
    const cp2y = 460 + t * 320;
    const endY = 620 + t * 340;

    const d = `M -50 ${startY.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, 1250 ${endY.toFixed(1)}`;

    lines.push({
      d,
      opacity: Number((0.22 - distFromCenter * 0.12).toFixed(3)),
      strokeWidth: Number((1.6 - distFromCenter * 0.6).toFixed(2)),
      dashArray: dashPatterns[i],
      ...timings[i],
    });
  }

  return lines;
}

const RIBBON_LINES = generateRibbonLines();

export function FlowingRibbons() {
  // Generate CSS keyframes for flow and sway
  const keyframesCss = `
    @keyframes ribbon-flow {
      0% {
        stroke-dashoffset: 0;
      }
      100% {
        stroke-dashoffset: -1000;
      }
    }

    ${RIBBON_LINES.map(
      (line, i) => `
      @keyframes ribbon-sway-${i} {
        0%, 100% {
          transform: translate(0px, 0px);
        }
        50% {
          transform: translate(${line.swayX}px, ${line.swayY}px);
        }
      }
    `
    ).join("\n")}

    @media (prefers-reduced-motion: reduce) {
      .flowing-ribbon-group,
      .flowing-ribbon-path {
        animation: none !important;
        stroke-dashoffset: 0 !important;
        transform: none !important;
      }
    }
  `;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: keyframesCss }} />
      <svg
        viewBox="0 0 1200 1000"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {RIBBON_LINES.map((line, i) => (
          <g
            key={i}
            className="flowing-ribbon-group"
            style={{
              animation: `ribbon-sway-${i} ${line.swayDuration}s ease-in-out infinite ${line.swayDelay}s`,
              willChange: "transform",
            }}
          >
            <path
              className="flowing-ribbon-path"
              d={line.d}
              pathLength={1000}
              stroke="rgba(255, 255, 255, 1)"
              strokeOpacity={line.opacity}
              strokeWidth={line.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={line.dashArray}
              fill="none"
              style={{
                animation: `ribbon-flow ${line.flowDuration}s linear infinite ${line.flowDelay}s`,
                willChange: "stroke-dashoffset",
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
