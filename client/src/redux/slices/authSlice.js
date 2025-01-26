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
          const response =  await authService.loginUser(userData);
          if(response.access){
            localStorage.setItem("access_token", response.access)
            
          }
          if(response.refresh){
            localStorage.setItem("refresh_token", response.refresh)
            
          }
          return response;
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

//Thunk for Google Authentication
export const googleLogin = createAsyncThunk(
  "/googleLogin",
  async({token, role}, thunkAPI)=>{
      try{
          const response =  await authService.googleLogin(token,role);
          if(response.access){
            localStorage.setItem("access_token", response.access)
            
          }
          if(response.refresh){
            localStorage.setItem("refresh_token", response.refresh)
            
          }
          return response;
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

//Thunk for User Logout
export const logoutUser = createAsyncThunk(
  "/logoutUser",
  async(tokenData, thunkAPI)=>{
      try{
          return await authService.logoutUser(tokenData);
        
      }catch(error){
        const message = 
        (error.response && 
         error.response.data && 
        (error.response.data.message || // Check for general message
          Object.values(error.response.data)[0])) || // Get first error if it's an object
          error.message ||
          error.toString();
          
          return thunkAPI.rejectWithValue(message);
      }
  }
);

//Thunk for Reset password OTP request
export const requestResetPasswordOtp = createAsyncThunk(
  "/resetPassword/requestOtp",
  async(emailData, thunkAPI)=>{
      try{
          return await authService.requestResetPasswordOtp(emailData);
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

//Thunk for Reset password OTP Verification
export const verifyResetPasswordOtp = createAsyncThunk(
  "/resetPassword/verifyOtp",
  async(otpData, thunkAPI)=>{
      try{
          return await authService.verifyResetPasswordOtp(otpData);
      }catch(error){
        const message = 
        (error.response && 
         error.response.data && 
         (error.response.data.otp || // Check for field-specific error
          error.response.data.message || // Check for general message
          Object.values(error.response.data)[0])) || // Get first error if it's an object
          error.message ||
          error.toString();
          
          return thunkAPI.rejectWithValue(message);
      }
  }
);

//Thunk for Reset password 
export const resetPassword = createAsyncThunk(
  "/resetPassword/resetPassword",
  async(resetData, thunkAPI)=>{
      try{
          return await authService.resetPassword(resetData);
      }catch(error){
        const message = 
        (error.response && 
         error.response.data && 
         (error.response.data.password || // Check for field-specific error
          error.response.data.message || // Check for general message
          Object.values(error.response.data)[0])) || // Get first error if it's an object
          error.message ||
          error.toString();
          
          return thunkAPI.rejectWithValue(message);
      }
  }
);

//Thunk for fetching user
export const fetchUser = createAsyncThunk(
  "/fetchUser",
  async(_, thunkAPI)=>{
      try{
          const response = await authService.fetchUser();
          return response
          
      }catch(error){
        const message = 
        (error.response && 
         error.response.data && 
         (error.response.data.message || // Check for general message
          Object.values(error.response.data)[0])) || // Get first error if it's an object
          error.message ||
          error.toString();
          
          return thunkAPI.rejectWithValue(message);
      }
  }
);

//Thunk for updating user profile
export const updateUser = createAsyncThunk(
  
  "/updateUser",
  async(formData, thunkAPI)=>{
    console.log("Inside Update uer thunk");
      try{
        console.log("Request Data:", formData);
        
        const response = await authService.updateUser(formData);
        console.log(response.data);
        return response.data
          
      }catch(error){
        const message = 
        (error.response && 
         error.response.data && 
         (error.response.data.message || // Check for general message
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
      userData: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
      isGoogleError: false,
      isGoogleSuccess:false,
      message: "",
      role:null,
      otpRequestSuccess: false,
      otpVerifySuccess: false,
      passwordResetSuccess: false,
      isAuthenticated : localStorage.getItem('isAuthenticated') === 'true',

    },
    reducers: {
      resetState: (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.isGoogleError = false;
        state.isGoogleSuccess = false;
        state.message = "";
        state.otpRequestSuccess = false;
        state.otpVerifySuccess = false;
        state.passwordResetSuccess = false;
      },
      logoutSuccess: (state)=>{
        state.userData = null;
        state.role = null;
        state.isAuthenticated = false;
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
          state.otpRequestSuccess = true
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
          // state.userData = action.payload; // Store the registered user data
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
          state.role = action.payload.role;
          state.message = action.payload.message;
          state.isAuthenticated = true;
          localStorage.setItem('isAuthenticated', 'true');
        })
        .addCase(loginUser.rejected, (state,action)=>{
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })

        //Handle Goole Login
        .addCase(googleLogin.pending, (state)=>{
          state.isLoading = true;
        })
        .addCase(googleLogin.fulfilled,(state,action)=>{
          state.isLoading = false;
          state.isSuccess = true;
          state.isGoogleSuccess = true;
          state.role = action.payload.role;
          state.message = "Google login Successfull";
          state.isAuthenticated = true;
          localStorage.setItem('isAuthenticated', 'true');
        })
        .addCase(googleLogin.rejected, (state,action)=>{
          state.isLoading = false;
          state.isError = true;
          state.isGoogleError = true;
          state.message = action.payload;
        })

        // Handle logout
        .addCase(logoutUser.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(logoutUser.fulfilled, (state) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.message = "User logged out successfully";
          state.role = null;
          state.userData = null;
          state.isAuthenticated = false;
          localStorage.removeItem('isAuthenticated');
        })
        .addCase(logoutUser.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })

         // Handle OTP Request
        .addCase(requestResetPasswordOtp.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(requestResetPasswordOtp.fulfilled, (state, action) => {
          state.isLoading = false;
          state.otpRequestSuccess = true;
          state.message = "OTP sent successfully to your email.";
        })
        .addCase(requestResetPasswordOtp.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })

        // Handle OTP Verification
        .addCase(verifyResetPasswordOtp.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(verifyResetPasswordOtp.fulfilled, (state) => {
          state.isLoading = false;
          state.otpVerifySuccess = true;
          state.message = "OTP verified successfully.";
        })
        .addCase(verifyResetPasswordOtp.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })

        // Handle Password Reset
        .addCase(resetPassword.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
          state.isLoading = false;
          state.passwordResetSuccess = true;
          state.message = "Password reset successfully.";
        })
        .addCase(resetPassword.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })

        // Handle users Fetch
        .addCase(fetchUser.pending, (state) => {
          state.isLoading = true;
          state.isError = false;
          state.isSuccess = false;
          state.message = "";
        })
        .addCase(fetchUser.fulfilled, (state, action) => {
          console.log('Previous state:', state);
          console.log('Payload:', action.payload);
          state.isLoading = false;
          state.isSuccess = true;
          state.message = "";
          state.userData = action.payload;
          state.isAuthenticated = true
          console.log(state.userData);
          
        })
        .addCase(fetchUser.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.isSuccess = false;
          state.message = action.payload || "Failed to fetch profile.";
          state.isAuthenticated = true
        })

        // Handle User Profile Updation
        .addCase(updateUser.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(updateUser.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          // state.userData = action.payload; // Store the registered user data
        })
        .addCase(updateUser.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
          console.log("updateUser slice:",state.message);
        })
    },
  });
  
  export const { resetState } = authSlice.actions;
  
  export default authSlice.reducer;