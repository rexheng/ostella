import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // --- Ostella redesign palette (2026-04-10) ---
        sage: {
          50: "#f3f8f4",
          100: "#e3eee6",
          200: "#c7dccd",
          300: "#9bc1a6",
          400: "#6fa182",
          500: "#4a8a5e",
          600: "#3a6e4b",
          700: "#2f5b3d",
          800: "#28482f",
          900: "#1c331f",
        },
        lavender: {
          50: "#f6f4fb",
          100: "#ece6f5",
          200: "#d6c9e7",
          300: "#b9a1d3",
          400: "#a087c5",
          500: "#8b6cc2",
          600: "#7251af",
          700: "#5b3f8e",
          800: "#4a346f",
          900: "#3b2a55",
        },
        cream: {
          50: "#fdfbf6",
          100: "#f8f3e8",
          200: "#efe5d0",
          300: "#e2d4b2",
        },
        ink: {
          500: "#5e5b53",
          700: "#3a3833",
          900: "#1c1b18",
        },
        clinical: {
          high: "#c2554e",
          "high-bg": "#fbe9e7",
          "high-border": "#f0c9c5",
          moderate: "#c4923a",
          "moderate-bg": "#fcefd9",
          "moderate-border": "#efd8a8",
          low: "#4a8a5e",
          "low-bg": "#e3eee6",
          "low-border": "#c7dccd",
        },
        // Legacy — retained for any consumer not yet migrated. Remove after full sweep.
        ostella: {
          50: "#f5f7fb",
          100: "#e8edf6",
          200: "#c9d6ec",
          300: "#9eb5d9",
          400: "#6d8cc0",
          500: "#486aa3",
          600: "#3a5488",
          700: "#31446e",
          800: "#2c3a59",
          900: "#28334d",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "20px",
        "3xl": "28px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 60s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
