"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Github, Hexagon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ENTER =
  "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] fill-mode-both motion-reduce:animate-none";

const stagger = (index: number, step = 60): React.CSSProperties => ({
  animationDelay: `${index * step}ms`,
});

const BrandMark = ({ className }: { className?: string }) => {
  return <Hexagon className={className} />;
};

const jitter = (i: number) => {
  const value = Math.sin(i + 1) * 10_000;
  return value - Math.floor(value);
};

const FloatingPaths = ({ position }: { position: number }) => {
  const reduceMotion = useReducedMotion();
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-primary"
        fill="none"
        viewBox="0 0 696 316"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            initial={{ pathLength: 0.3 }}
            animate={
              reduceMotion
                ? undefined
                : { pathLength: 1, pathOffset: [0, 1, 0] }
            }
            stroke="currentColor"
            className="opacity-60"
            strokeOpacity={0.1 + path.id * 0.03}
            strokeWidth={path.width}
            transition={{
              duration: 20 + jitter(path.id) * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

const Login03 = () => {
  const [redirecting, setRedirecting] = React.useState(false);

  const onContinue = async () => {
    setRedirecting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setRedirecting(false);
  };

  return (
    <section
      data-slot="login"
      className="relative min-h-svh overflow-hidden bg-background lg:grid lg:grid-cols-2"
    >
      <aside
        data-slot="login-aside"
        className="relative hidden h-full flex-col overflow-hidden border-e border-border bg-card p-10 lg:flex"
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent, transparent, var(--background))",
          }}
        />

        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        <div className={cn(ENTER, "relative z-10 flex items-center gap-2")}>
          <BrandMark className="size-6 text-foreground" />
          <span className="text-base font-semibold tracking-[-0.025em]">
            Hirael
          </span>
        </div>

        <figure
          style={stagger(4)}
          className={cn(ENTER, "relative z-10 mt-auto flex flex-col gap-3")}
        >
          <blockquote className="font-serif text-2xl leading-[1.25] tracking-tight md:text-3xl">
            We wired up auth in an afternoon and{" "}
            <span className="italic text-foreground">never looked back</span>.
            The source lives in our repo, so it bends to us.
          </blockquote>
          <figcaption className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
            <span>Platform team</span>
            <span aria-hidden className="text-border">
              |
            </span>
            <span>Northwind</span>
          </figcaption>
        </figure>
      </aside>

      <div
        data-slot="login-main"
        className="relative flex min-h-svh flex-col justify-center px-8 lg:min-h-0"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-60"
        >
          <div
            className="absolute end-0 top-0 h-320 w-140 -translate-y-88 rounded-full"
            style={{
              background:
                "radial-gradient(68.54% 68.72% at 55.02% 31.46%, color-mix(in oklch, var(--foreground) 6%, transparent) 0, color-mix(in oklch, var(--foreground) 2%, transparent) 50%, color-mix(in oklch, var(--foreground) 1%, transparent) 80%)",
            }}
          />
          <div
            className="absolute end-0 top-0 h-320 w-60 translate-x-[5%] -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, color-mix(in oklch, var(--foreground) 4%, transparent) 0, color-mix(in oklch, var(--foreground) 1%, transparent) 80%, transparent 100%)",
            }}
          />
        </div>

        <Button
          asChild
          variant="ghost"
          className={cn(ENTER, "absolute start-5 top-7 z-10 gap-1.5")}
        >
          <Link href="/">
            <ChevronLeft className="size-4 rtl:rotate-180" />
            Home
          </Link>
        </Button>

        <div
          data-slot="login-panel"
          className="relative z-10 mx-auto w-full space-y-6 sm:max-w-sm"
        >
          <div className={cn(ENTER, "flex items-center gap-2 lg:hidden")}>
            <BrandMark className="size-6 text-foreground" />
            <span className="text-base font-semibold tracking-[-0.025em]">
              Hirael
            </span>
          </div>

          <div data-slot="login-header" className="flex flex-col gap-2">
            <h1
              style={stagger(1)}
              className={cn(
                ENTER,
                "font-serif text-4xl font-medium tracking-tight sm:text-5xl",
              )}
            >
              Sign in or join.
            </h1>
            <p
              style={stagger(2)}
              className={cn(ENTER, "text-sm text-muted-foreground")}
            >
              Sign in with your email and password, or use a provider.
            </p>
          </div>

          <form style={stagger(3)} className={cn(ENTER, "flex flex-col gap-4")}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">Email</label>
              <input 
                id="email" 
                type="email" 
                placeholder="name@example.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">Password</label>
              <input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              />
            </div>
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div style={stagger(4)} className={cn(ENTER, "relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border")}>
            <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>

          <div style={stagger(5)} className={cn(ENTER, "flex flex-col gap-3")}>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={redirecting}
              onClick={onContinue}
              className="w-full gap-2 text-foreground"
            >
              {redirecting ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <svg className="size-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {redirecting ? "Redirecting to Google…" : "Continue with Google"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={redirecting}
              onClick={onContinue}
              className="w-full gap-2 text-foreground"
            >
              {redirecting ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <Github className="size-4" />
              )}
              {redirecting ? "Redirecting to GitHub…" : "Continue with GitHub"}
            </Button>
          </div>

          <p
            style={stagger(6)}
            className={cn(ENTER, "text-xs text-muted-foreground")}
          >
            By continuing, you agree to the{" "}
            <a
              href="#"
              className="text-foreground underline-offset-4 hover:underline"
            >
              terms
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-foreground underline-offset-4 hover:underline"
            >
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login03;
