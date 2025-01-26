import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as adminService from '../services/adminServices'


//Thunk for User Login
export const adminLogin = createAsyncThunk(
  "/adminLogin",
  async(adminData, thunkAPI)=>{
      try{
          const response =  await adminService.adminLogin(adminData);
          if(response.access){
            localStorage.setItem("access_token", response.access)
            localStorage.setItem("isAdmin",true)
            
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

//Thunk for Admin Logout
export const adminLogout = createAsyncThunk(
  "/adminLogout",
  async(tokenData, thunkAPI)=>{
      try{
          return await adminService.adminLogout(tokenData);
        
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

//Thunk for Fetching Admin
export const fetchAdmin = createAsyncThunk(
  "/fetchAdmin",
  async(_,thunkAPI)=>{
      try{
          return await adminService.fetchAdmin();
        
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

//Thunk for Fetching tutots from admin
export const fetchAdminTutors = createAsyncThunk(
  "/fetchAdminTutors",
  async(id = null,thunkAPI)=>{
      try{
          return await adminService.fetchAdminTutors(id);
        
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

//Thunk for Fetching students from admin
export const fetchAdminStudents = createAsyncThunk(
  "/fetchAdminStudents",
  async(id = null,thunkAPI)=>{
      try{
          return await adminService.fetchAdminStudents(id);
        
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

// Thunk for toggling tutor authorization
export const updateTutorAuthorization = createAsyncThunk(
  "admin/updateTutorAuthorization",
  async ({ id, is_verified }, thunkAPI) => {
    try {
      return await adminService.updateTutorAuthorization(id, is_verified);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.detail || Object.values(error.response.data)[0])) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Thunk for updating user active status
export const updateUserActiveStatus = createAsyncThunk(
  "admin/updateUserActiveStatus",
  async ({ id, is_active }, thunkAPI) => {
    try {
      return await adminService.updateUserActiveStatus(id, is_active);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.detail || Object.values(error.response.data)[0])) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const adminSlice = createSlice({
    name: "admin",
    initialState: {
      adminData: null,
      adminTutorsData: [],
      singleTutor : null,
      adminStudentsData:[],
      singleStudent:null,
      isLoading: false,
      isError: false,
      isSuccess: false,
      message: "",
      isAdminAuthenticated : false,

    },
    reducers: {
      resetAdminState: (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      },
      adminLogoutSuccess: (state)=>{
        state.adminData = null;
        state.isAdminAuthenticated = false;
        state.adminTutorsData = [];
      },
    },
    extraReducers: (builder) => {
      builder
        // Handle Admin Login
        .addCase(adminLogin.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(adminLogin.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.message = action.payload.message;
          state.isAdminAuthenticated = true;
        })
        .addCase(adminLogin.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })

        //Handle Admin Logout
        .addCase(adminLogout.pending, (state) =>{
          state.isLoading = true;
        })
        .addCase(adminLogout.fulfilled, (state) =>{
          state.isLoading = false;
          state.isSuccess = true;
          state.message = "Logged out successfully";
          state.adminData = null;
          state.adminTutorsData = [];
          state.singleTutor = null;
          state.isAdminAuthenticated = false;
        })

        //Handle Fetch Admin
        .addCase(fetchAdmin.pending, (state)=>{
          state.isLoading = true;
        })
        .addCase(fetchAdmin.fulfilled, (state,action)=>{
          state.isSuccess = true;
          state.adminData = action.payload;
        })
        .addCase(fetchAdmin.rejected, (state, action)=>{
          state.isError = true;
          state.message = action.payload;
        })

        //Handle Fetch Admin Tutors
        .addCase(fetchAdminTutors.pending, (state)=>{
          state.isLoading = true;
        })
        .addCase(fetchAdminTutors.fulfilled, (state, action)=>{
          state.isSuccess = true;
          state.isLoading = false;
          if(Array.isArray(action.payload)){
            state.adminTutorsData = action.payload;
          }else{
            state.singleTutor = action.payload;
          }
          
        })
        .addCase(fetchAdminTutors.rejected, (state, action)=>{ 
          state.isError = true;
          state.message = action.payload;
        })

        //Handle UpdateTutorAuthorization
        .addCase(updateTutorAuthorization.pending, (state)=>{
          state.isLoading = true;
        })
        .addCase(updateTutorAuthorization.fulfilled, (state,action)=>{
          state.isSuccess = true;
          state.isLoading = false;
          state.message = action.payload;
        })
        .addCase(updateTutorAuthorization.rejected, (state,action)=>{
          state.isError = true;
          state.message = action.payload;
        })

        //Handle UpdateUserActiveStatus
        .addCase(updateUserActiveStatus.pending, (state)=>{
          state.isLoading = true;
        })
        .addCase(updateUserActiveStatus.fulfilled, (state,action)=>{
          state.isSuccess = true;
          state.isLoading = false;
          state.message = action.payload;
        })
        .addCase(updateUserActiveStatus.rejected, (state,action)=>{
          state.isError = true;
          state.message = action.payload;
        })

        //Handle Fetch Admin Students
        .addCase(fetchAdminStudents.pending, (state)=>{
          state.isLoading = true;
        })
        .addCase(fetchAdminStudents.fulfilled, (state, action)=>{
          state.isSuccess = true;
          state.isLoading = false;
          if(Array.isArray(action.payload)){
            state.adminStudentsData = action.payload;
          }else{
            state.singleStudent = action.payload;
          }
          
        })
        .addCase(fetchAdminStudents.rejected, (state, action)=>{ 
          state.isError = true;
          state.message = action.payload;
        })
    },
  });

export const { resetAdminState } = adminSlice.actions;
  
export default adminSlice.reducer;