import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#EEF2FA",
          100: "#D5DFF3",
          200: "#AABFE8",
          300: "#809FDC",
          400: "#557FD1",
          500: "#2B5FC5",
          600: "#1E4A8A",
          700: "#1A3A6B",
          800: "#132B50",
          900: "#0D1C35",
          950: "#060E1C",
        },
        saffron: {
          50:  "#FFF4EC",
          100: "#FFE2C9",
          200: "#FFC494",
          300: "#FFA55F",
          400: "#FF8C2A",
          500: "#E65C00",
          600: "#CC5200",
          700: "#B34700",
          800: "#993D00",
          900: "#803200",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;