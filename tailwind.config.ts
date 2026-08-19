import type { Config } from "tailwindcss";

const config: Config = {
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
          background: "#0D0F10",
          sidebar: "#101213",
          card: "#151718",
          elevated: "#1A1C1D",
          hover: "#202223",
          border: {
            DEFAULT: "#2A2D2E",
            secondary: "#222526",
            divider: "#292C2D",
          },
          text: {
            DEFAULT: "#F2F2F0",
            secondary: "#A5A8A8",
            muted: "#737777",
            disabled: "#555959",
          },
          accent: {
            DEFAULT: "#8FAFA5",
            hover: "#A5C0B7",
            bg: "rgba(143,175,165,0.10)",
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
