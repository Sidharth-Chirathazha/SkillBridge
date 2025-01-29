// src/components/CustomButton.jsx
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main, // Use primary color from theme
  color: theme.palette.common.white, // White text
  padding: '8px 16px', // Customize padding
  borderRadius: '8px', // Rounded corners
  textTransform: 'none', // Disable uppercase text
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Add a subtle shadow
  '&:hover': {
    backgroundColor: theme.palette.primary.dark, // Darker shade on hover
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground, // Disabled styles
    color: theme.palette.action.disabled,
  },
}));

export default CustomButton;
