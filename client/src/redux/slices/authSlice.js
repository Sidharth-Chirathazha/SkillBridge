import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import * as authService from '../services/authService';

//Thunk for user registration
export const registerUser = createAsyncThunk(
    "/registerUser",
    async(userData, thunkAPI)=>{
        try{
            return await authService.registerUser(userData);
        }catch(error){
          const message = 
          (error.response && 
           error.response.data && 
           (error.response.data.email || // Check for field-specific error
            error.response.data.message || // Check for general message
            Object.values(error.response.data)[0])) || // Get first error if it's an object
            error.message ||
            error.toString();
            
            return thunkAPI.rejectWithValue(message);
        }
    }
);

//Thunk for Otp verification
export const verifyOtp = createAsyncThunk(
    "/verifyOtp",
    async(otpData, thunkAPI)=>{
     try {
        return await authService.verifyOtp(otpData);
     } catch (error) {
      const message = 
      (error.response && 
       error.response.data && 
       (error.response.data.otp || // Check for OTP-specific error
        error.response.data.message ||
        Object.values(error.response.data)[0])) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message); 
     }   
    }
);


//Thunk for User Login
export const loginUser = createAsyncThunk(
  "/loginUser",
  async(userData, thunkAPI)=>{
      try{
          return await authService.loginUser(userData);
      }catch(error){
        const message = 
        (error.response && 
         error.response.data && 
         (error.response.data.email || // Check for field-specific error
          error.response.data.message || // Check for general message
          Object.values(error.response.data)[0])) || // Get first error if it's an object
          error.message ||
          error.toString();
          
          return thunkAPI.rejectWithValue(message);
      }
  }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
      user: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
      message: "",
      token: null,
      refreshToken: null,
      role: null,

    },
    reducers: {
      resetState: (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      },
      logout: (state)=>{
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.role = null;
      },
    },
    extraReducers: (builder) => {
      builder
        // Handle user registration
        .addCase(registerUser.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.message = "OTP sent successfully";
        })
        .addCase(registerUser.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })
  
        // Handle OTP verification
        .addCase(verifyOtp.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(verifyOtp.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.user = action.payload; // Store the registered user data
        })
        .addCase(verifyOtp.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })
        
        //Handle User login
        .addCase(loginUser.pending, (state)=>{
          state.isLoading = true;
        })
        .addCase(loginUser.fulfilled,(state,action)=>{
          state.isLoading = false;
          state.isSuccess = true;
          state.token = action.payload.access;
          state.refreshToken = action.payload.refresh;
          state.role = action.payload.role;
          state.message = action.payload.message;
        })
        .addCase(loginUser.rejected, (state,action)=>{
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })
    },
  });
  
  export const { resetState } = authSlice.actions;
  
  export default authSlice.reducer;