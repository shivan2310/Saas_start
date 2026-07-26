import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { CheckSquare, Wallet, CalendarDays, BookOpen, Lock, Search } from "lucide-react";

const features = [
  {
    icon: CheckSquare,
    title: "To-dos that move with you",
    description: "Capture everyday tasks, set priorities, and see what needs your attention without the clutter.",
  },
  {
    icon: Wallet,
    title: "A clearer view of your money",
    description: "Record expenses as they happen and understand where your money is going over time.",
  },
  {
    icon: CalendarDays,
    title: "Important dates remembered",
    description: "Keep birthdays, anniversaries, appointments, and other dates close at hand.",
  },
  {
    icon: BookOpen,
    title: "Your personal diary",
    description: "Write private entries, reflect on your days, and build a record of the moments that matter.",
  },
  {
    icon: Lock,
    title: "Private by design",
    description: "Your personal information is tied to your account and kept separate from everyone else’s.",
  },
  {
    icon: Search,
    title: "One place to find things",
    description: "Stop searching across scattered notes and apps. Your everyday life has one home.",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="w-full py-24 bg-surface border-b border-border">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">One place for your life</h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
            Less to remember. More time to live.
          </p>
          <p className="text-sm text-muted">
            Daybook brings the practical and personal parts of your life together in a calm, focused workspace.
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
