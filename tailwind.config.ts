import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#070709",
          elevated: "#0d0d12",
          card: "#11121a",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.12)",
        },
        accent: {
          DEFAULT: "#3b82f6",
          glow: "rgba(59,130,246,0.45)",
          dim: "#1e40af",
          bright: "#60a5fa",
        },
        chrome: {
          DEFAULT: "#c0c8d4",
          dim: "#8b95a7",
        },
        ink: {
          DEFAULT: "#e8ecf2",
          dim: "#9ca5b8",
          muted: "#5a6378",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.10), transparent 60%)",
        "chrome-gradient":
          "linear-gradient(135deg, #e8ecf2 0%, #8b95a7 50%, #4a5366 100%)",
        "blue-gradient":
          "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1e40af 100%)",
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(59,130,246,0.5), 0 8px 40px -8px rgba(59,130,246,0.45)",
        chrome: "0 0 0 1px rgba(192,200,212,0.3), 0 4px 20px -4px rgba(192,200,212,0.25)",
        soft: "0 4px 30px -8px rgba(0,0,0,0.5)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(59,130,246,0.5)" },
          "50%": { boxShadow: "0 0 0 12px rgba(59,130,246,0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
