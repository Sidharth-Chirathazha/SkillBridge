import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import * as authService from '../services/authService';


const handleApiError = (error, thunkAPI)=>{
  const message =
    error.response?.data?.message || // General message
    error.response?.data?.email ||  // Specific email error
    Object.values(error.response?.data || {})[0] || // First error if object
    error.message ||
    error.toString();

return thunkAPI.rejectWithValue(message);
}

//Thunk for user registration
export const registerUser = createAsyncThunk(
    "/registerUser",
    async(userData, thunkAPI)=>{
        try{
            return await authService.registerUser(userData);
        }catch(error){
          return handleApiError(error, thunkAPI);
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
      return handleApiError(error, thunkAPI);
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
        return handleApiError(error, thunkAPI);
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
        return handleApiError(error, thunkAPI);
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
        return handleApiError(error, thunkAPI);
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
        return handleApiError(error, thunkAPI);
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
        return handleApiError(error, thunkAPI);
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
        return handleApiError(error, thunkAPI);
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
        return handleApiError(error, thunkAPI);
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
        return handleApiError(error, thunkAPI);
      }
  }
);

//Thunk for fetching user
export const fetchSkills = createAsyncThunk(
  "/fetchSkills",
  async(_, thunkAPI)=>{
      try{
          const response = await authService.fetchSkills();
          return response
          
      }catch(error){
        return handleApiError(error, thunkAPI);
      }
  }
);


//Thunk for posting tutor review
export const postTutorReview = createAsyncThunk(
  'tutor/postTutorReview',
  async (reviewInfo, thunkAPI) => {
    try {
      return await authService.postTutorReview(reviewInfo);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for fetching tutor reviews
export const fetchTutorReviews = createAsyncThunk(
  'tutor/fetchTutorReviews',
  async (tutorId, thunkAPI) => {
    try {
      return await authService.fetchTutorReviews(tutorId);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);


//Thunk for fetching user wallet
export const fetchWallet = createAsyncThunk(
  'tutor/wallet',
  async (_, thunkAPI) => {
    try {
      return await authService.fetchWallet();
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for fetching user wallet
export const fetchTransactions = createAsyncThunk(
  'tutor/transactions',
  async ({page, pageSize}, thunkAPI) => {
    try {
      return await authService.fetchTransactions(page, pageSize);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
      userData: null,
      skillsData: [],
      tutorReviewsData:[],
      walletData:null,
      transactionsData:[],
      isLoading: false,
      isError: false,
      isUpdateError: false,
      isSuccess: false,
      isGoogleError: false,
      isGoogleSuccess:false,
      isTutorReviewsLoading: false,
      isTutorReviewsError:false,
      isTutorReviewsSuccess:false,
      isWalletLoading : false,
      isWalletSuccess: false,
      isWalletError: false,
      isTransactionsLoading: false,
      isTransactionsError: false,
      isTransactionsSuccess: false,
      message: "",
      role:null,
      otpRequestSuccess: false,
      otpVerifySuccess: false,
      passwordResetSuccess: false,
      isAuthenticated : localStorage.getItem('isAuthenticated') === 'true',
      currentPage:1,
      totalPages:1

    },
    reducers: {
      resetState: (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isUpdateError = false;
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
      resetReviewsState: (state) => {
        state.isTutorReviewsLoading = false;
        state.isTutorReviewsError = false;
        state.isTutorReviewsSuccess = false;
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
          state.role = action.payload?.role || null;
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
          console.log(state.userData);
          
        })
        .addCase(fetchUser.rejected, (state, action) => {
          state.isError = true;
          state.message = action.payload || "Failed to fetch profile.";
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
          state.isUpdateError = true;
          state.message = action.payload;
          console.log("updateUser slice:",state.message);
        })
        .addCase(fetchSkills.pending, (state)=>{
          state.isLoading = true;
        })
        .addCase(fetchSkills.fulfilled, (state, action)=>{
          state.isSuccess = true;
          state.isLoading = false;
          state.skillsData = action.payload;
        })
        .addCase(fetchSkills.rejected, (state, action)=>{
          state.isError = true;
          state.message = action.payload;
        })


        //Post tutor Review
        .addCase(postTutorReview.pending,(state)=>{
          state.isTutorReviewsLoading = true;
        })
        .addCase(postTutorReview.fulfilled,(state,action)=>{
          state.isTutorReviewsSuccess = true;
          state.isTutorReviewsLoading = false;
          state.message = action.payload;
        })
        .addCase(postTutorReview.rejected, (state, action)=>{
          state.isTutorReviewsError = true;
          state.message = action.payload;
        })
  
        //Fethc tutor reviews
        .addCase(fetchTutorReviews.pending, (state)=>{
          state.isTutorReviewsLoading = true;
        })
        .addCase(fetchTutorReviews.fulfilled,(state,action)=>{
          state.isTutorReviewsLoading = false;
          state.isTutorReviewsSuccess = true;
          state.tutorReviewsData = action.payload;
        })
        .addCase(fetchTutorReviews.rejected,(state)=>{
          state.isTutorReviewsError = true;
          state.message = action.payload;
        })

        //Fethc user wallet
        .addCase(fetchWallet.pending, (state)=>{
          state.isWalletLoading = true;
        })
        .addCase(fetchWallet.fulfilled,(state,action)=>{
          state.isWalletLoading = false;
          state.isWalletSuccess = true;
          state.walletData = action.payload;
        })
        .addCase(fetchWallet.rejected,(state)=>{
          state.isWalletError = true;
          state.message = action.payload;
        })

        //Fethc user transactions
        .addCase(fetchTransactions.pending, (state)=>{
          state.isTransactionsLoading = true;
        })
        .addCase(fetchTransactions.fulfilled,(state,action)=>{
          state.isTransactionsLoading = false;
          state.isTransactionsSuccess = true;
          state.transactionsData = action.payload.results;
          state.currentPage = action.payload.current_page || 1;
          state.totalPages = action.payload.total_pages
        })
        .addCase(fetchTransactions.rejected,(state)=>{
          state.isTransactionsError = true;
          state.message = action.payload;
        })
    },
  });
  
  export const { resetState } = authSlice.actions;
  
  export default authSlice.reducer;