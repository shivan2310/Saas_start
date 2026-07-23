import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="w-full bg-background pt-16 pb-24 md:pt-28 md:pb-36 border-b border-border">
      <div className="container mx-auto max-w-5xl px-4 text-center sm:px-6">
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-black mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-black" />
          <span>PRODUCTION-READY NEXT.JS STARTER</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-black max-w-4xl mx-auto leading-[1.08]">
          The Minimal Full-Stack SaaS Template
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-muted max-w-2xl mx-auto font-normal leading-relaxed">
          Clean architecture, Firebase Authentication, Firestore database, strict TypeScript, and Next.js App Router. Built for rapid, scalable deployment.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Get Started Free
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sign In to Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Pill Tags */}
        <div className="mt-16 pt-8 border-t border-border/60 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-muted uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-black" />
            <span>Firebase Auth & Firestore</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-black" />
            <span>Strict Type Safety</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-black" />
            <span>Vercel Optimized</span>
          </div>
        </div>
      </div>
    </section>
  );
};
