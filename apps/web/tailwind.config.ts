import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        muted: "var(--muted)",
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
          50: "#F4F4F2",
          100: "#E9E9E6",
          200: "#D6D6D2",
          300: "#B8B8B4",
          400: "#777773",
          500: "#4F4F4A",
          600: "#111111",
          700: "#333333",
          800: "#222222",
          900: "#111111"
        }
      },
      fontFamily: {
        ui: ["var(--font-sans)"],
        editorial: ["var(--serif)"]
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
