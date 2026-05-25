import type { Config } from "tailwindcss";

/**
 * Typography scale — fluid, mobile-first.
 * Each step uses `clamp(min, preferred, max)` so type scales smoothly
 * from 360px phones up to large desktops without media-query stair-steps.
 * Line-heights and letter-spacing are tuned for Persian text
 * (Persian glyphs are taller than Latin so we use a slightly more
 * generous default line-height and a near-zero tracking).
 */
const fluid = (minRem: number, maxRem: number, minVw = 360, maxVw = 1280) => {
  const slope = ((maxRem - minRem) * 16) / (maxVw - minVw);
  const intercept = minRem - (slope * minVw) / 16;
  return `clamp(${minRem}rem, ${intercept.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw, ${maxRem}rem)`;
};

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff4ec",
          100: "#ffe4d1",
          200: "#ffc59c",
          300: "#ffa15f",
          400: "#ff8330",
          500: "#f56a16", // primary chomp orange
          600: "#e2540a",
          700: "#bb3e08",
          800: "#94320d",
          900: "#762a10",
          950: "#401204",
        },
        ink: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#252525",
          900: "#171717",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-vazir)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Tahoma",
          "Geeza Pro",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-peyda)",
          "var(--font-vazir)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Tahoma",
          "Arial",
          "sans-serif",
        ],
      },
      // Fluid type ramp [size, { lineHeight, letterSpacing }]
      fontSize: {
        xs: [fluid(0.75, 0.8125), { lineHeight: "1.6", letterSpacing: "0" }],
        sm: [fluid(0.8125, 0.9375), { lineHeight: "1.65", letterSpacing: "0" }],
        base: [
          fluid(0.9375, 1.0625),
          { lineHeight: "1.75", letterSpacing: "0" },
        ],
        lg: [
          fluid(1.0625, 1.1875),
          { lineHeight: "1.7", letterSpacing: "-0.005em" },
        ],
        xl: [
          fluid(1.1875, 1.375),
          { lineHeight: "1.55", letterSpacing: "-0.01em" },
        ],
        "2xl": [
          fluid(1.375, 1.75),
          { lineHeight: "1.35", letterSpacing: "-0.015em" },
        ],
        "3xl": [
          fluid(1.625, 2.25),
          { lineHeight: "1.25", letterSpacing: "-0.02em" },
        ],
        "4xl": [
          fluid(1.875, 2.875),
          { lineHeight: "1.15", letterSpacing: "-0.025em" },
        ],
        "5xl": [
          fluid(2.25, 3.5),
          { lineHeight: "1.1", letterSpacing: "-0.03em" },
        ],
        "6xl": [
          fluid(2.625, 4.25),
          { lineHeight: "1.05", letterSpacing: "-0.035em" },
        ],
        "7xl": [fluid(3.125, 5), { lineHeight: "1", letterSpacing: "-0.04em" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
        tight: "-0.015em",
        normal: "0",
        wide: "0.01em",
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(245,106,22,0.55)",
        card: "0 6px 30px -12px rgba(0,0,0,0.25)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shine: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        floaty: "floaty 5s ease-in-out infinite",
        shine: "shine 3s linear infinite",
        "fade-in": "fade-in .6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
