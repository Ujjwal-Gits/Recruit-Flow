/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        colors: {
            "primary": "#0f172a",
            "nordic-green": "#10B981",
            "deep-slate": "#374151",
            "medium-slate": "#6B7280",
            "background-light": "#FFFFFF",
            "background-alt": "#F9FAFB",
            "background-dark": "#10221c",
            "border-light": "#E5E7EB",
        },
        fontFamily: {
            "display": ["Inter", "sans-serif"],
            "mono": ["JetBrains Mono", "monospace"]
        },
        keyframes: {
            'glass-shine': {
                '0%': { transform: 'translateX(-150%) skewX(12deg)' },
                '100%': { transform: 'translateX(200%) skewX(12deg)' }
            }
        },
        animation: {
            'glass-shine': 'glass-shine 2s infinite ease-in-out'
        },
        borderRadius: {
            "lg": "1rem",
            "xl": "1.5rem",
            "2xl": "2rem",
            "3xl": "2.5rem",
        },
    },
  },
  plugins: [],
}
