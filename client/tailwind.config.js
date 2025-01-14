/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        secondary: {
          DEFAULT: '#F23276',    // Default Pink
          50: '#FFE6EE',        // Very light pink
          100: '#FFCCE0',       // Light pink
          200: '#FF99C2',       // Softer pink
          300: '#FF66A3',       // Medium pink
          400: '#F94A89',       // Slightly darker pink
          500: '#F23276',       // Original Pink
          600: '#D12A64',       // Dark pink
          700: '#A2214E',       // Deeper pink
          800: '#731838',       // Very deep pink 
          900: '#440F22',       // Almost maroon
        },
        primary: {
          DEFAULT: '#1E467F',   // Default Navy blue
          50: '#E5EDF7',        // Very light navy
          100: '#CCDCEF',       // Light navy
          200: '#99B8DF',       // Softer navy
          300: '#6694CF',       // Medium navy
          400: '#336FBE',       // Slightly darker navy
          500: '#1E467F',       // Original Navy blue
          600: '#18376C',       // Dark navy
          700: '#132856',       // Deeper navy
          800: '#0D1A40',       // Very deep navy
          900: '#070C2A',       // Almost black navy
        },
        background: {
          DEFAULT: '#EEF1F7',   // Default Light gray
          50: '#FFFFFF',        // White
          100: '#FBFBFD',       // Very light gray
          200: '#F5F6FA',       // Softer gray
          300: '#ECEEF4',       // Medium gray
          400: '#E1E4EC',       // Slightly darker gray
          500: '#EEF1F7',       // Original Light gray
          600: '#CBCFD7',       // Dark gray
          700: '#A8ACB7',       // Deeper gray
          800: '#858895',       // Very deep gray
          900: '#626572',       // Almost black gray
        },
        text: {
          DEFAULT: '#273044',   // Default Dark blue
          50: '#F2F4F8',        // Very light blue
          100: '#E5E9F1',       // Light blue
          200: '#C3C9E0',       // Softer blue
          300: '#A2AACF',       // Medium blue
          400: '#7A87B6',       // Slightly darker blue
          500: '#273044',       // Original Dark blue
          600: '#202A3B',       // Dark blue
          700: '#19222F',       // Deeper blue
          800: '#121924',       // Very deep blue
          900: '#0A0F17',       // Almost black blue
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
