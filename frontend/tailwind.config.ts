import type { Config } from "tailwindcss";

/**
 * SponsorFit palette
 *  - eggplant : deep purple-black surfaces (the "night" of the UI)
 *  - violet   : structure, links, secondary actions
 *  - orchid   : orchid pink, energy and highlights
 *  - signal   : signal orange, reserved for primary actions and Fit Scores
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        eggplant: {
          950: "#12061f",
          900: "#1a0b2e",
          850: "#210f3a",
          800: "#2a1548",
          700: "#3a1f5f",
          600: "#4d2b7a",
        },
        violet: {
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        orchid: {
          200: "#f9c6ee",
          300: "#f5a3e6",
          400: "#ef7fd8",
          500: "#e25bc6",
        },
        signal: {
          400: "#ff8a3d",
          500: "#ff6a13",
          600: "#e5560a",
        },
        ink: {
          DEFAULT: "#f6eeff",
          soft: "#d9c9f0",
          muted: "#a691c6",
          faint: "#7d6a9c",
        },
        mint: "#5eead4",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(239,127,216,0.25), 0 12px 40px -12px rgba(255,106,19,0.35)",
        lift: "0 20px 50px -20px rgba(0,0,0,0.6)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "float-slow": "float 10s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
