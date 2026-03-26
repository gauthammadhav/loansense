export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        ui:      ['Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark:        '#0A0A0F',
        dark2:       '#111118',
        dark3:       '#1A1A24',
        lime:        '#C8F135',
        'lime-dark': '#9BBF00',
        success:     '#4ADE80',
        danger:      '#F87171',
        warning:     '#FBBF24',
        info:        '#818CF8',
      },
      borderRadius: {
        glass: '20px',
        card:  '16px',
        btn:   '10px',
        badge: '20px',
        input: '10px',
      },
    },
  },
  plugins: [],
};
