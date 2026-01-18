export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'paper-white': '#f8f7f4',
        'ink-black': '#383c3c',
        'text-main': '#111111',
        'text-inv': '#f5f5f5',
      },
      fontFamily: {
        serif: ['"Shippori Mincho"', '"Noto Serif JP"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
};
