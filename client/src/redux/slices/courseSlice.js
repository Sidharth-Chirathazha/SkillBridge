import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as courseService from '../services/courseService';

// Thunk for fetching categories
export const fetchCategories = createAsyncThunk(
  "course/fetchCategories",
  async (_, thunkAPI) => {
    try {
      return await courseService.fetchCategories();
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

// Thunk for adding category
export const addCategory = createAsyncThunk(
    "course/addCategory",
    async (categoryInfo, thunkAPI) => {
      try {
        return await courseService.addCategory(categoryInfo);
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

// Thunk for updating category
export const updateCategory = createAsyncThunk(
    "course/updateCategory",
    async ({id, updateData}, thunkAPI) => {
      try {
        return await courseService.updateCategory(id,updateData);
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

  // Thunk for deleting category
export const deleteCategory = createAsyncThunk(
    "course/deleteCategory",
    async (id, thunkAPI) => {
      try {
        return await courseService.deleteCategory(id);
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


const courseSlice = createSlice({
    name: "course",
    initialState: {
      categoriesData : [],
      isCategoryLoading: false,
      isCategoryError: false,
      isCategorySuccess: false,
      message: "",
    },
    reducers: {
      resetCourseState: (state) => {
        state.isCategoryLoading = false;
        state.isCategoryError = false;
        state.isCategorySuccess = false;
        state.message = "";
      },
    },
    extraReducers: (builder) => {
      builder

      //Fethcing Categories
      .addCase(fetchCategories.pending, (state)=>{
        state.isCategoryLoading = true;
      })
      .addCase(fetchCategories.fulfilled,(state,action)=>{
        state.isCategoryLoading = false;
        state.isCategorySuccess = true;
        state.categoriesData = action.payload;
      })
      .addCase(fetchCategories.rejected,(state)=>{
        state.isCategoryError = true;
        state.message = action.payload;
      })

      //Adding Category
      .addCase(addCategory.pending,(state)=>{
        state.isCategoryLoading = true;
      })
      .addCase(addCategory.fulfilled,(state,action)=>{
        state.isCategorySuccess = true;
        state.isCategoryLoading = false;
        state.message = action.payload;
      })
      .addCase(addCategory.rejected, (state, action)=>{
        state.isCategoryError = true;
        state.message = action.payload;
      })

      
      //Update Category
      .addCase(updateCategory.pending,(state)=>{
        state.isCategoryLoading = true;
      })
      .addCase(updateCategory.fulfilled,(state,action)=>{
        state.isCategorySuccess = true;
        state.isCategoryLoading = false;
        state.message = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action)=>{
        state.isCategoryError = true;
        state.message = action.payload;
      })

      //Delete category
      .addCase(deleteCategory.pending,(state)=>{
        state.isCategoryLoading = true;
      })
      .addCase(deleteCategory.fulfilled,(state,action)=>{
        state.isCategorySuccess = true;
        state.isCategoryLoading = false;
        state.message = action.payload;
      })
      .addCase(deleteCategory.rejected, (state, action)=>{
        state.isCategoryError = true;
        state.message = action.payload;
      })
       
    },
  });

export const { resetCourseState } = courseSlice.actions;
  
export default courseSlice.reducer;