// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite 1s reverse',
        'float-slow': 'float 10s ease-in-out infinite 3s',
        'backdrop-fade-in': 'backdrop-fade-in 0.3s ease-out',
        'modal-slide-in': 'modal-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'gradient-xy': 'gradient-xy 3s ease infinite',
      },
      backdropBlur: {
        'xl': '24px',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}