import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-white py-12 text-black">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-base tracking-tight">
              <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-[10px] font-mono">
                S
              </div>
              <span>NIVIO</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              A private home for your tasks, expenses, important dates, and daily thoughts.
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">Product</h4>
            <ul className="space-y-1.5 text-xs text-muted">
              <li><Link href="#features" className="hover:text-black transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-black transition-colors">Pricing</Link></li>
              <li><Link href="#docs" className="hover:text-black transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">Resources</h4>
            <ul className="space-y-1.5 text-xs text-muted">
              <li><Link href="/login" className="hover:text-black transition-colors">Login</Link></li>
              <li><Link href="/signup" className="hover:text-black transition-colors">Sign Up</Link></li>
              <li><a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Deployment</a></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">Legal</h4>
            <ul className="space-y-1.5 text-xs text-muted">
              <li><Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} Nivio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-black" /> System Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
