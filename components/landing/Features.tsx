import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Lock, Database, Code2, ShieldAlert, Cpu, Rocket } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Firebase Authentication",
    description: "Email & Password login, registration, email verification, session persistence, and protected routes out of the box.",
  },
  {
    icon: Database,
    title: "Firestore Integration",
    description: "Pre-configured user profile sync with strict security rules and typed schema collection helpers.",
  },
  {
    icon: Code2,
    title: "Strict TypeScript",
    description: "End-to-end type safety with zero any types, reusable components, and strict compiler settings.",
  },
  {
    icon: ShieldAlert,
    title: "Security Hardened",
    description: "Input validation via Zod, rate limiting strategies, security headers, and safe environment configuration.",
  },
  {
    icon: Cpu,
    title: "React Hook Form & Zod",
    description: "Performant client and server form validation with meaningful error messages and accessibility labels.",
  },
  {
    icon: Rocket,
    title: "Vercel Ready",
    description: "Optimized Next.js App Router architecture ready to deploy instantly with zero runtime configuration.",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="w-full py-24 bg-surface border-b border-border">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Architecture</h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
            Built for Scalability & Clean Code
          </p>
          <p className="text-sm text-muted">
            Everything you need to launch a modern SaaS product without boilerplate clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="hover:border-black transition-colors">
                <CardHeader>
                  <div className="w-10 h-10 rounded bg-black text-white flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="mt-2 text-xs leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
