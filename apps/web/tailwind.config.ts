import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        "surface-hover": "var(--surface-hover)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        brand: {
          50: "#fff8f0",
          100: "#ffefd6",
          200: "#ffd9ad",
          300: "#ffc282",
          400: "#ffa44d",
          500: "#ff8a24",
          600: "#f36b0f",
          700: "#c9520d",
          800: "#9f3f12",
          900: "#7f3313"
        }
      },
      fontFamily: {
        ui: ["var(--font-sans)"],
        editorial: ["var(--font-display)"]
      },
      fontSize: {
        display: ["clamp(2.25rem, 5vw, 3.75rem)", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
        h2: ["clamp(1.75rem, 3vw, 2.25rem)", { lineHeight: "1.2" }],
        h3: ["1.375rem", { lineHeight: "1.25" }],
        lede: ["1.125rem", { lineHeight: "1.65" }],
        body: ["1rem", { lineHeight: "1.6" }],
        meta: ["0.875rem", { lineHeight: "1.45" }],
        eyebrow: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.14em" }]
      },
      borderRadius: {
        card: "12px",
        hero: "20px"
      }
    }
  },
  plugins: []
};

export default config;
