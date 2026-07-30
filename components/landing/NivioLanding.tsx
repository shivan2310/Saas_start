"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const VIDEO_SOURCE =
  "/Hand_writing_in_open_journal_202607292151.mp4";

type FrameCanvas = HTMLCanvasElement | OffscreenCanvas;

function frameContext(canvas: FrameCanvas) {
  return canvas.getContext("2d", { alpha: false });
}

function CinematicMemory() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useRef<FrameCanvas[]>([]);
  const lastTime = useRef(-1);
  const renderFrame = useRef(0);
  const direction = useRef(1);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const output = canvasRef.current;
    if (!video || !output) return;

    let captureHandle = 0;
    let animationHandle = 0;
    let cancelled = false;
    let usedVideoFrameCallback = false;
    const videoWithFrames = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (callback: () => void) => number;
      cancelVideoFrameCallback?: (handle: number) => void;
    };

    const capture = () => {
      if (cancelled || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      if (Math.abs(video.currentTime - lastTime.current) < 0.001) return;

      const captureWidth = Math.min(video.videoWidth, 960);
      const captureHeight = Math.round((captureWidth / video.videoWidth) * video.videoHeight);
      if (!captureWidth || !captureHeight) return;

      const frame: FrameCanvas =
        typeof OffscreenCanvas !== "undefined"
          ? new OffscreenCanvas(captureWidth, captureHeight)
          : Object.assign(document.createElement("canvas"), { width: captureWidth, height: captureHeight });
      const context = frameContext(frame);
      context?.drawImage(video, 0, 0, captureWidth, captureHeight);
      frames.current.push(frame);
      lastTime.current = video.currentTime;
    };

    const scheduleCapture = () => {
      capture();
      if (!video.ended && !cancelled) {
        if (videoWithFrames.requestVideoFrameCallback) {
          usedVideoFrameCallback = true;
          captureHandle = videoWithFrames.requestVideoFrameCallback(scheduleCapture);
        } else {
          usedVideoFrameCallback = false;
          captureHandle = requestAnimationFrame(scheduleCapture);
        }
      }
    };

    const paint = () => {
      const frame = frames.current[renderFrame.current];
      const context = output.getContext("2d", { alpha: false });
      if (frame && context) {
        if (output.width !== frame.width || output.height !== frame.height) {
          output.width = frame.width;
          output.height = frame.height;
        }
        context.drawImage(frame, 0, 0);
      }

      if (frames.current.length > 1) {
        if (renderFrame.current >= frames.current.length - 1) direction.current = -1;
        if (renderFrame.current <= 0) direction.current = 1;
        renderFrame.current += direction.current;
      }
      animationHandle = window.setTimeout(() => requestAnimationFrame(paint), 1000 / 30) as unknown as number;
    };

    const finish = () => {
      capture();
      setHasFinished(true);
      renderFrame.current = 0;
      direction.current = 1;
      paint();
    };

    video.addEventListener("ended", finish, { once: true });
    video.addEventListener("loadeddata", scheduleCapture, { once: true });
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) scheduleCapture();

    return () => {
      cancelled = true;
      if (usedVideoFrameCallback && videoWithFrames.cancelVideoFrameCallback) {
        videoWithFrames.cancelVideoFrameCallback(captureHandle);
      } else cancelAnimationFrame(captureHandle);
      clearTimeout(animationHandle);
      cancelAnimationFrame(animationHandle);
      video.removeEventListener("ended", finish);
      video.removeEventListener("loadeddata", scheduleCapture);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        className={`absolute left-0 top-0 h-full w-full scale-[1.15] object-cover object-top ${hasFinished ? "hidden" : ""}`}
        src={VIDEO_SOURCE}
        autoPlay
        muted
        playsInline
        preload="auto"
      />
      <canvas
        ref={canvasRef}
        className={`absolute left-0 top-0 h-full w-full scale-[1.15] object-cover object-top ${hasFinished ? "block" : "hidden"}`}
      />
    </div>
  );
}

const features = [
  ["01", "Journal", "/dashboard/diary"],
  ["02", "Organize", "/dashboard"],
  ["03", "Remember", "/dashboard/tasks"],
];

export function NivioLanding() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden text-[#191919]" style={{ backgroundColor: "#ffffff" }}>
      <CinematicMemory />

      <header className="fixed inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 sm:h-20 max-w-[1440px] items-center justify-between px-4 sm:px-10 lg:px-14">
          <Link href="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.03em] text-[#191919]">
            <span className="relative block h-[17px] w-[17px] rounded-[5px] border border-[#191919]">
              <span className="absolute left-[4px] top-[4px] h-[7px] w-[7px] rounded-full bg-[#191919]" />
            </span>
            Nivio
          </Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex" aria-label="Primary navigation">
            {["Features", "Privacy", "AI", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[13px] text-[#191919]/70 transition-colors duration-200 hover:text-[#191919]">
                {item}
              </a>
            ))}
          </nav>
          <Link href="/signup" className="rounded-full bg-[#191919] px-4 py-2 text-[12px] font-medium text-[#fff] transition-colors duration-200 hover:bg-[#3a3a3a] shadow-sm">
            Start Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 sm:px-10 pt-20 sm:pt-24 pb-[270px] sm:pb-[260px] md:pb-[250px] text-center">
        <div className="flex max-w-2xl flex-col items-center my-auto">
          <h1 className="font-serif text-[clamp(2.15rem,6.5vw,7.25rem)] leading-[0.95] sm:leading-[0.92] tracking-[-0.05em] sm:tracking-[-0.065em] text-[#191919]">
            Your life,<br />beautifully remembered.
          </h1>
          <p className="mt-5 sm:mt-8 max-w-md text-xs sm:text-[15px] leading-relaxed sm:leading-7 text-[#191919]/75 font-normal">
            A private space where your journal, tasks, reminders, expenses, memories, and everyday life come together. AI quietly organizes everything for you while your personal data remains completely yours.
          </p>
          <Link href="/signup" className="mt-5 sm:mt-8 inline-flex items-center rounded-full bg-[#191919] px-5 py-2.5 sm:py-3 text-xs sm:text-[13px] font-medium text-[#fff] transition-colors duration-200 hover:bg-[#3a3a3a] shadow-sm">
            Start Free
          </Link>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="absolute inset-x-0 bottom-0 z-20 border-t border-[#191919]/10 shadow-lg" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-10 lg:px-14">
          <div className="grid gap-3 sm:gap-8 py-4 sm:py-7 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-8">
            <div>
              <p className="text-[9px] sm:text-[10px] font-medium tracking-[0.16em]" style={{ color: "rgba(25, 25, 25, 0.6)" }}>YOUR DIGITAL DIARY</p>
              <h2 className="mt-1.5 sm:mt-3 font-serif text-[clamp(1.35rem,2.8vw,2.7rem)] leading-[1.05] sm:leading-[0.98] tracking-[-0.045em]" style={{ color: "#191919" }}>
                Designed for<br className="hidden sm:inline" /> everyday life.
              </h2>
            </div>
            <p className="max-w-xl self-end text-[11px] sm:text-[13px] md:text-[14px] leading-relaxed sm:leading-6" style={{ color: "#191919" }}>
              Capture your thoughts, organize your day, remember meaningful moments, track expenses, manage tasks, and let AI connect everything naturally—without compromising your privacy.
            </p>
          </div>
          <div className="h-px" style={{ backgroundColor: "rgba(25, 25, 25, 0.1)" }} />
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 py-2.5 sm:py-4">
            {features.map(([number, title, href]) => (
              <Link key={title} href={href} className="group flex min-w-0 items-center justify-between px-2.5 sm:px-5 py-2.5 sm:py-4 rounded-sm sm:rounded-none transition-colors duration-200 hover:opacity-90" style={{ backgroundColor: "#f4f3f3" }}>
                <span className="flex min-w-0 items-baseline gap-1.5 sm:gap-3">
                  <span className="text-[9px] sm:text-[10px]" style={{ color: "rgba(25, 25, 25, 0.5)" }}>{number}</span>
                  <span className="truncate text-[11px] sm:text-[13px] font-medium" style={{ color: "#191919" }}>{title}</span>
                </span>
                <ArrowRight className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" style={{ color: "#191919" }} strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
