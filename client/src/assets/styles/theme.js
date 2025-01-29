// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E467F',// Match your primary DEFAULT color
      heading:'#070C2A',
    },
    secondary: {
      main: '#F23276', // Match your secondary DEFAULT color
    },
    background: {
      default: '#EEF1F7', // Match your background DEFAULT color
      paper: '#FFFFFF', // For elevated surfaces
    },
    text: {
      primary: '#273044',
      secondary: '#626572',
    },
  },
  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','),
  },
});

export default theme;
