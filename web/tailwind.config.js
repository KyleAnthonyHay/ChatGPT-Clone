/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/streamdown/dist/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg': '#212121',
        'sidebar-bg': '#171717',
        'hover-bg': '#2f2f2f',
        'border-subtle': '#3a3a3a',
        'text-primary': '#ececec',
        'text-secondary': '#9b9b9b',
        'user-bubble': '#303030',
      },
      fontFamily: {
        sans: ['Söhne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
