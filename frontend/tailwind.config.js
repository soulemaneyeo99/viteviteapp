const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette officielle ViteviteApp (Pro Design)
        primary: {
          DEFAULT: "#FF8C00", // Orange principal
          dark: "#FF6F00",    // Orange foncé (hover/active)
          light: "#FFB74D",   // Orange clair
          50: "#FFF8E1",
          100: "#FFECB3",
          200: "#FFE082",
          300: "#FFD54F",
          400: "#FFCA28",
          500: "#FFC107",
          600: "#FFB300",
          700: "#FFA000",
          800: "#FF8F00",
          900: "#FF6F00",
        },
        secondary: {
          DEFAULT: "#10B981", // Vert (Success/Open)
          light: "#D1FAE5",
        },
        background: "#F3F4F6", // Gris clair (Light Gray)
        foreground: "#111827", // Gris foncé (Dark Gray)

        // shadcn/ui compatibility & Functional Colors
        border: "#E5E7EB",
        input: "#F9FAFB", // Very light gray for inputs
        ring: "#FF8C00",

        // Status colors
        success: "#10B981", // Green
        warning: "#F59E0B", // Amber
        error: "#EF4444",   // Red
        info: "#8B5CF6",    // Purple (Stats)

        // Custom grays for text
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      boxShadow: {
        "custom-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "custom-md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        "custom-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        "custom-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;