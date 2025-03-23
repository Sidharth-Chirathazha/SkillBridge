
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main, 
  color: theme.palette.common.white, 
  padding: '8px 16px', 
  borderRadius: '8px', 
  textTransform: 'none', 
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', 
  '&:hover': {
    backgroundColor: theme.palette.primary.dark, 
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

export default CustomButton;
