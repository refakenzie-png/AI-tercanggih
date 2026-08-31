import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050c18',
        panel: '#0d1728',
        accent: '#67e8f9',
        violet: '#8b5cf6',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
      },
      boxShadow: {
        neon: '0 0 30px rgba(103, 232, 249, 0.23)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at center, rgba(103,232,249,0.18) 0, transparent 55%)',
      },
    },
  },
  plugins: [],
};

export default config;
