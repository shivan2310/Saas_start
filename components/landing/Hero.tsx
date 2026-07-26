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
          <span>A CALMER WAY TO MANAGE EVERYDAY LIFE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-black max-w-4xl mx-auto leading-[1.08]">
          Everything important in your life, in one place.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-muted max-w-2xl mx-auto font-normal leading-relaxed">
          Daybook helps you stay on top of what you need to do, what you spend, the dates you cannot forget, and the thoughts you want to keep.
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
              Open your Daybook
            </Button>
          </Link>
        </div>

        {/* Feature Pill Tags */}
        <div className="mt-16 pt-8 border-t border-border/60 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-muted uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-black" />
            <span>Private by design</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-black" />
            <span>Simple to use</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-black" />
            <span>Always with you</span>
          </div>
        </div>
      </div>
    </section>
  );
};
