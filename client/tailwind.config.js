/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  // Remove unused CSS in production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './public/index.html',
    ],
    options: {
      safelist: {
        standard: ['html', 'body', 'root'],
        deep: [/^animate-/, /^transition-/],
        greedy: [/^bg-gradient-/, /^text-/]
      }
    }
  },
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
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont', 
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"'
        ],
        // SHOP.CO Design System Fonts
        integral: ['Integral CF', 'sans-serif'], // For headings (uppercase, heavy weight)
        satoshi: ['Satoshi', 'sans-serif'], // For body text (clean sans-serif)
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Consolas',
          '"Liberation Mono"',
          'Menlo',
          'monospace'
        ]
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#000000", // SHOP.CO: Black for buttons and headings
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F0F0F0", // SHOP.CO: Product card backgrounds
          foreground: "#000000",
        },
        accent: {
          DEFAULT: "#FF3333", // SHOP.CO: Discount badges
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "rgba(0, 0, 0, 0.6)", // SHOP.CO: Rating text, breadcrumbs (#00000099)
          foreground: "rgba(0, 0, 0, 0.6)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "#F0F0F0", // SHOP.CO: Product card background
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // SHOP.CO Design System Border Radius
        '2xl': "20px", // Product cards
        'full': "9999px", // Buttons and search bars
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}