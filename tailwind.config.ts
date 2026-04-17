import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        ring: "rgb(var(--ring))",
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        primary: {
          DEFAULT: "rgb(var(--primary))",
          foreground: "rgb(var(--primary-foreground))",
          hover: "rgb(var(--primary-hover))",
          light: "rgb(var(--primary-light))",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary))",
          foreground: "rgb(var(--secondary-foreground))",
          hover: "rgb(var(--secondary-hover))",
          light: "rgb(var(--secondary-light))",
        },
        success: {
          DEFAULT: "rgb(var(--success))",
          foreground: "rgb(var(--success-foreground))",
          hover: "rgb(var(--success-hover))",
          light: "rgb(var(--success-light))",
        },
        warning: {
          DEFAULT: "rgb(var(--warning))",
          foreground: "rgb(var(--warning-foreground))",
          hover: "rgb(var(--warning-hover))",
          light: "rgb(var(--warning-light))",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive))",
          foreground: "rgb(var(--destructive-foreground))",
          hover: "rgb(var(--destructive-hover))",
          light: "rgb(var(--destructive-light))",
        },
        info: {
          DEFAULT: "rgb(var(--info))",
          foreground: "rgb(var(--info-foreground))",
          hover: "rgb(var(--info-hover))",
          light: "rgb(var(--info-light))",
        },
        muted: {
          DEFAULT: "rgb(var(--muted))",
          foreground: "rgb(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent))",
          foreground: "rgb(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "rgb(var(--popover))",
          foreground: "rgb(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "rgb(var(--card))",
          foreground: "rgb(var(--card-foreground))",
          border: "rgb(var(--card-border))",
        },
        sidebar: {
          DEFAULT: "rgb(var(--sidebar-background))",
          foreground: "rgb(var(--sidebar-foreground))",
          primary: "rgb(var(--sidebar-primary))",
          "primary-foreground": "rgb(var(--sidebar-primary-foreground))",
          accent: "rgb(var(--sidebar-accent))",
          "accent-foreground": "rgb(var(--sidebar-accent-foreground))",
          border: "rgb(var(--sidebar-border))",
          active: "rgb(var(--sidebar-active))",
          "active-foreground": "rgb(var(--sidebar-active-foreground))",
        },
        header: {
          DEFAULT: "rgb(var(--header-background))",
          foreground: "rgb(var(--header-foreground))",
          border: "rgb(var(--header-border))",
        },
        table: {
          header: "rgb(var(--table-header))",
          border: "rgb(var(--table-border))",
          hover: "rgb(var(--table-hover))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
