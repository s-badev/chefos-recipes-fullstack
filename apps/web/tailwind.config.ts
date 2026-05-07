import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
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
      }
    }
  },
  plugins: []
};

export default config;
