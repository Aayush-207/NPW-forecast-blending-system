/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#0f172a", // slate-900
        "midnight-slate": "#1e293b", // slate-800
        "frosted-slate": "#334155", // slate-700
        "slate-border": "#475569", // slate-600
        "monsoon-cyan": "#38bdf8", // sky-400
        "atlantic-blue": "#2563eb", // blue-600
        "quantum-violet": "#8b5cf6", // violet-500
        "neural-emerald": "#10b981", // emerald-500
        "amber-alert": "#f59e0b", // amber-500
        "crimson-hazard": "#ef4444", // red-500
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-hazard": "pulseHazard 2s ease-in-out infinite",
        "radar-sweep": "radarSweep 3s linear infinite",
        "glow-cyan": "glowCyan 2s ease-in-out infinite alternate",
      },
      keyframes: {
        pulseHazard: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(230, 57, 70, 0.6)" },
          "50%": { boxShadow: "0 0 20px 10px rgba(230, 57, 70, 0.2)" },
        },
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        glowCyan: {
          "0%": { boxShadow: "0 0 5px rgba(0, 242, 254, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 242, 254, 0.6)" },
        },
      },
    },
  },
  plugins: [],
}
