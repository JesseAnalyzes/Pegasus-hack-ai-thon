import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'dark-bg': 'var(--background)',
        'dark-card': 'var(--card-bg)',
        'dark-border': 'var(--card-border)',
        'dark-sidebar': 'var(--sidebar-bg)',
        'accent-blue': 'var(--accent-blue)',
        'accent-orange': 'var(--accent-orange)',
        'accent-yellow': 'var(--accent-yellow)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;

