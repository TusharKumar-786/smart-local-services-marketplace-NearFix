/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F5C63',
          dark: '#0A4247',
          light: '#17747D',
        },
        accent: {
          DEFAULT: '#F2A32C',
          dark: '#D98A19',
          light: '#F5B44E',
        },
        emergency: {
          DEFAULT: '#D8402F',
          dark: '#B82F20',
          light: '#E25E50',
        },
        success: {
          DEFAULT: '#2E8B57',
          dark: '#246D44',
          light: '#3EA86C',
        },
        bg: '#FAF7F2',
        surface: '#FFFFFF',
        tint: '#E3F0F0',
        ink: '#1E2A2E',
        muted: '#5B6B70',
        sand: '#E4DED3',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        body: ['Inter', '"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(30, 42, 46, 0.05)',
        'soft-md': '0 4px 12px rgba(30, 42, 46, 0.08)',
        'soft-lg': '0 8px 24px rgba(30, 42, 46, 0.12)',
      },
    },
  },
  plugins: [],
}
