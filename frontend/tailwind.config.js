/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // 忍者必须死3 水墨风格配色
      colors: {
        'ink': {
          DEFAULT: '#1a1a1a',
          light: '#2d2d2d',
          dark: '#0a0a0a',
        },
        'paper': {
          DEFAULT: '#f5f5f0',
          dark: '#e8e8e0',
        },
        'accent': {
          red: '#c53030',    // 朱红
          blue: '#2b6cb0',   // 靛蓝
          gold: '#d69e2e',   // 金
          green: '#38a169',  // 竹青
        },
        'ninja': {
          black: '#000000',
          white: '#ffffff',
          gray: '#4a5568',
          'light-gray': '#a0aec0',
        }
      },
      // 书法风格字体
      fontFamily: {
        'sans': ['"Microsoft YaHei"', '"Hiragino Sans GB"', '"WenQuanYi Micro Hei"', 'sans-serif'],
        'serif': ['"STKaiti"', 'KaiTi', 'serif'],
        'mono': ['"Courier New"', 'monospace'],
      },
      // 水墨效果动画
      animation: {
        'ink-blur': 'inkBlur 0.5s ease-out',
        'paper-fade': 'paperFade 0.3s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        inkBlur: {
          '0%': { opacity: 0, transform: 'scale(0.95)', filter: 'blur(4px)' },
          '100%': { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
        },
        paperFade: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
      },
      // 宣纸纹理背景
      backgroundImage: {
        'paper-texture': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\" fill=\"%239C92AC\" fill-opacity=\"0.05\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')",
      },
      // 毛笔边框效果
      borderWidth: {
        '3': '3px',
        '6': '6px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
        '3xl': '3rem',
      },
    },
  },
  plugins: [],
}