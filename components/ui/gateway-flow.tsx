"use client";

import React, { useEffect, useRef } from "react";

export function GatewayFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let time = 0;

    // Handle Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    });
    
    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Draw static fallback
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const yOffset = (i - 2) * 40;
        ctx.moveTo(0, height / 2 + yOffset);
        for (let x = 0; x <= width; x += 50) {
          ctx.lineTo(x, height / 2 + yOffset);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 - (Math.abs(i - 2) * 0.008)})`;
        ctx.stroke();
      }
      return () => resizeObserver.disconnect();
    }

    // Animation loop
    const render = () => {
      time += 0.002;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle flowing lines
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const yOffset = (i - 2) * 60;
        // The lines wave slowly
        ctx.moveTo(0, height / 2 + yOffset + Math.sin(time + i) * 60);
        
        for (let x = 0; x <= width; x += 20) {
          const y = height / 2 + yOffset + Math.sin(time + i + x * 0.003) * 60;
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 - (Math.abs(i - 2) * 0.008)})`;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-60 mix-blend-screen"
      />
    </div>
  );
}
