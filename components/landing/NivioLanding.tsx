"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const VIDEO_SOURCE =
  "https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_30fps.mp4";

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
  ["01", "Journal"],
  ["02", "Organize"],
  ["03", "Remember"],
];

export function NivioLanding() {
  return (
    <main className="relative h-[100dvh] min-h-[680px] overflow-hidden bg-white text-[#191919]">
      <CinematicMemory />

      <header className="fixed inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14">
          <Link href="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.03em]">
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
          <Link href="/signup" className="rounded-full bg-[#191919] px-4 py-2 text-[12px] font-medium text-white transition-colors duration-200 hover:bg-[#3a3a3a]">
            Start Free
          </Link>
        </div>
      </header>

      <section className="relative z-10 flex h-full items-center justify-center px-6 pb-[250px] text-center sm:px-10">
        <div className="mt-4 flex max-w-2xl flex-col items-center">
          <h1 className="font-serif text-[clamp(3.65rem,7.5vw,7.25rem)] leading-[0.92] tracking-[-0.065em] text-[#191919]">
            Your life,<br />beautifully remembered.
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-7 text-[#191919]/70 sm:text-[16px]">
            A private space where your journal, tasks, reminders, expenses, memories, and everyday life come together. AI quietly organizes everything for you while your personal data remains completely yours.
          </p>
          <Link href="/signup" className="mt-8 inline-flex items-center rounded-full bg-[#191919] px-5 py-3 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-[#3a3a3a]">
            Start Free
          </Link>
        </div>
      </section>

      <section className="absolute inset-x-0 bottom-0 z-10 border-t border-[#191919]/10 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <div className="grid gap-8 py-7 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-8">
            <div>
              <p className="text-[10px] font-medium tracking-[0.16em] text-[#191919]/55">YOUR DIGITAL DIARY</p>
              <h2 className="mt-3 font-serif text-[clamp(1.8rem,2.8vw,2.7rem)] leading-[0.98] tracking-[-0.045em]">Designed for<br />everyday life.</h2>
            </div>
            <p className="max-w-xl self-end text-[13px] leading-6 text-[#191919]/70 sm:text-[14px]">
              Capture your thoughts, organize your day, remember meaningful moments, track expenses, manage tasks, and let AI connect everything naturally—without compromising your privacy.
            </p>
          </div>
          <div className="h-px bg-[#191919]/10" />
          <div className="grid grid-cols-3 gap-2 py-3 sm:gap-3 sm:py-4">
            {features.map(([number, title]) => (
              <a key={title} href={`#${title.toLowerCase()}`} className="group flex min-w-0 items-center justify-between bg-[#f4f3f3] px-3 py-3 transition-colors duration-200 hover:bg-[#e9e8e8] sm:px-5 sm:py-4">
                <span className="flex min-w-0 items-baseline gap-2 sm:gap-3">
                  <span className="text-[10px] text-[#191919]/50">{number}</span>
                  <span className="truncate text-[12px] font-medium sm:text-[13px]">{title}</span>
                </span>
                <ArrowRight className="ml-2 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
