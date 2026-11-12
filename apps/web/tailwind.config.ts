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
        "accent-fill": "var(--accent-fill)",
        // Sofra (dark): pages that are not redesigned yet keep their utility classes and read on the dark ground.
        // 600 is the red fill (white text on it); 700-800 are text colours (red, then ink on hover).
        brand: {
          50: "var(--surface)",
          100: "rgba(229, 72, 77, 0.28)",
          200: "var(--line-strong)",
          300: "var(--line-strong)",
          400: "var(--accent)",
          500: "var(--accent)",
          600: "var(--accent-fill)",
          700: "var(--accent-soft)",
          800: "var(--ink)",
          900: "var(--ink)"
        },
        // Tailwind's red scale (admin delete buttons, error notes), turned for the dark ground.
        red: {
          50: "var(--surface)",
          200: "rgba(229, 72, 77, 0.55)",
          300: "var(--accent)",
          700: "var(--accent-soft)",
          800: "var(--ink)"
        },
        // Tailwind's grey scale, turned for the dark ground: light text, visible field borders.
        neutral: {
          50: "var(--ink)",
          100: "var(--ink)",
          200: "var(--line-strong)",
          300: "var(--line-strong)",
          400: "var(--muted)",
          500: "var(--muted)",
          600: "var(--muted)",
          700: "var(--ink)",
          800: "var(--ink)",
          900: "var(--ink)",
          950: "var(--ink)"
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
