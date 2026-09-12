import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["P22 Mackinac W01 Book", "Georgia", "serif"],
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        hover: "hsl(var(--hover) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        "muted-light": "hsl(var(--muted-light) / <alpha-value>)",
        dash: {
          background: "var(--dash-background)",
          sidebar: "var(--dash-sidebar)",
          card: "var(--dash-card)",
          surface: "var(--dash-surface)",
          elevated: "var(--dash-elevated)",
          hover: "var(--dash-hover)",
          border: {
            DEFAULT: "var(--dash-border)",
            secondary: "var(--dash-border-secondary)",
            divider: "var(--dash-border-divider)",
          },
          text: {
            DEFAULT: "var(--dash-text)",
            secondary: "var(--dash-text-secondary)",
            muted: "var(--dash-text-muted)",
            disabled: "var(--dash-text-disabled)",
          },
          accent: {
            DEFAULT: "var(--dash-accent)",
            hover: "var(--dash-accent-hover)",
            bg: "var(--dash-accent-bg)",
          }
        }
      },
      borderRadius: {
        DEFAULT: "8px",
        md: "8px",
        lg: "8px",
        sm: "4px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 2px 8px 0 rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
