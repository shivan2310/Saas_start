import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export const CTA: React.FC = () => {
  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded border border-black bg-black p-8 sm:p-12 text-white text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Make space for what matters.
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto font-normal">
            Create your private Nivio and start bringing your everyday life into focus.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start your Nivio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
