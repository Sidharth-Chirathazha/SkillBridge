import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as courseService from '../services/courseService';
import toast from "react-hot-toast";


const handleApiError = (error, thunkAPI)=>{
  const message = error.response?.data?.detail || error.response?.data?.error || error.message;
  toast.error(message)
  return thunkAPI.rejectWithValue(message);
}

// Thunk for fetching categories
export const fetchCategories = createAsyncThunk(
  "/course/fetchCategories",
  async (_, thunkAPI) => {
    try {
      return await courseService.fetchCategories();
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

// Thunk for adding category
export const addCategory = createAsyncThunk(
    "/course/addCategory",
    async (categoryInfo, thunkAPI) => {
      try {
        return await courseService.addCategory(categoryInfo);
      } catch (error) {
        return handleApiError(error, thunkAPI);
      }
    }
  );

// Thunk for updating category
export const updateCategory = createAsyncThunk(
    "/course/updateCategory",
    async ({id, updateData}, thunkAPI) => {
      try {
        return await courseService.updateCategory(id,updateData);
      } catch (error) {
        return handleApiError(error, thunkAPI);
      }
    }
  );

  // Thunk for deleting category
export const deleteCategory = createAsyncThunk(
    "/course/deleteCategory",
    async (id, thunkAPI) => {
      try {
        return await courseService.deleteCategory(id);
      } catch (error) {
        return handleApiError(error, thunkAPI);
      }
    }
  );


// Thunk for adding course
export const addCourse = createAsyncThunk(
  "/course/addCourse",
  async (courseInfo, thunkAPI) => {
    try {
      return await courseService.addCourse(courseInfo);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

// Thunk for fetching courses
export const fetchCourses = createAsyncThunk(
  "/course/fetchCourses",
  async ({page, pageSize, status, user, categoryId, limit }, thunkAPI) => {
    try {
      return await courseService.fetchCourses(page, pageSize,status,user,categoryId,limit);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

// Thunk for fetching courses
export const fetchPurchasedCourses = createAsyncThunk(
  "/course/purchasedCourses",
  async ({page, pageSize}, thunkAPI) => {
    try {
      return await courseService.fetchPurchasedCourses(page, pageSize);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

// Thunk for fetching tutor courses
export const fetchTutorCourses = createAsyncThunk(
  "/course/fetchTutorCourses",
  async ({ tutorId, page, pageSize, status }, thunkAPI) => {
    try {
      return await courseService.fetchTutorCourses(tutorId, page, pageSize, status);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

// Thunk for updating Course
export const updateCourse = createAsyncThunk(
  "/course/updateCourse",
  async ({id, updateData}, thunkAPI) => {
    console.log(id);
    
    try {
      return await courseService.updateCourse(id,updateData);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);


// Thunk for deleting course
export const deleteCourse = createAsyncThunk(
  "/course/deleteCourse",
  async (id, thunkAPI) => {
    try {
      return await courseService.deleteCourse(id);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

// Thunk for adding Module
export const addModule = createAsyncThunk(
  "/course/addModule",
  async (moduleInfo, thunkAPI) => {
    try {
      return await courseService.addModule(moduleInfo);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

// Thunk for fetching modules
export const fetchModules = createAsyncThunk(
  "/course/fetchModules",
  async (courseId, thunkAPI) => {
    try {
      return await courseService.fetchModules(courseId);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

// Thunk for updating Module
export const updateModule = createAsyncThunk(
  "/course/updateModule",
  async ({id, updateData}, thunkAPI) => {
    try {
      return await courseService.updateModule(id,updateData);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

// Thunk for deleting module
export const deleteModule = createAsyncThunk(
  "/course/deleteModule",
  async (id, thunkAPI) => {
    try {
      return await courseService.deleteModule(id);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

 // Thunk for fetching single course
 export const fetchSingleCourse = createAsyncThunk(
  "/course/fetchSingleCourse",
  async ({id,user}, thunkAPI) => {
    console.log(id);
    
    try {
      return await courseService.fetchSingleCourse(id,user);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for stripe checkout
export const initiateCheckout = createAsyncThunk(
  'courses/checkout',
  async (courseId, thunkAPI) => {
    try {
      return await courseService.createCheckoutSession(courseId);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for purchase verification
export const verifyPurchaseStatus = createAsyncThunk(
  'courses/verifyPurchase',
  async (sessionId, thunkAPI) => {
    try {
      return await courseService.verifyPurchase(sessionId);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);


//Thunk for posting review
export const postReview = createAsyncThunk(
  'courses/postReview',
  async (reviewInfo, thunkAPI) => {
    try {
      return await courseService.postReview(reviewInfo);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for fetching reviews
export const fetchReviews = createAsyncThunk(
  'courses/fetchReviews',
  async (courseSlug, thunkAPI) => {
    try {
      return await courseService.fetchReviews(courseSlug);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for posting comments
export const postComment = createAsyncThunk(
  'courses/postComment',
  async ({courseId, newComment, parentId}, thunkAPI) => {
    try {
      return await courseService.postComment(courseId, newComment, parentId);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for fetching Comments
export const fetchComments = createAsyncThunk(
  'courses/fetchComments',
  async (courseId, thunkAPI) => {
    try {
      return await courseService.fetchComments(courseId);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for deleting Comments
export const deleteComment = createAsyncThunk(
  'courses/deleteComment',
  async (commentId, thunkAPI) => {
    try {
      return await courseService.deleteComment(commentId);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for sending trade request 
export const sendTradeRequest = createAsyncThunk(
  'courses/requestTrade',
  async (requestData, thunkAPI) => {
    try {
      return await courseService.sendTradeRequest(requestData);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for fetching Comments
export const fetchTradeRequests = createAsyncThunk(
  'courses/fetchTradeRequests',
  async (_, thunkAPI) => {
    try {
      return await courseService.fetchTradeRequests();
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);

//Thunk for updating trade request 
export const updateTradeRequest = createAsyncThunk(
  'courses/updateTradeRequest',
  async ({tradeId,action}, thunkAPI) => {
    try {
      return await courseService.updateTradeRequest(tradeId, action);
    } catch (error) {
      return handleApiError(error, thunkAPI);
    }
  }
);


const courseSlice = createSlice({
    name: "course",
    initialState: {
      categoriesData : [],
      coursesData:[],
      purchasedCoursesData:[],
      tutorCoursesData:[],
      modulesData:[],
      singleCourse:null,
      reviewsData:[],
      commentsData:[],
      requestedTrades: [],
      receivedTrades: [],
      isCategoryLoading: false,
      isCategoryError: false,
      isCategorySuccess: false,
      isCourseLoading: false,
      isCourseError: false,
      isCourseSuccess:false,
      isModuleLoading: false,
      isModuleError: false,
      isModuleSuccess: false,
      isReviewsLoading: false,
      isReviewsError:false,
      isReviewsSuccess:false,
      isCommentsLoading:false,
      isCommentsSuccess:false,
      isCommentsError:false,
      isCheckoutLoading: false,
      isTradeLoading:false,
      tradeError:null,
      checkoutError: null,
      checkoutSession: null,
      currentPage: 1,
      totalPages: 1,
      message: "",
    },
    reducers: {
      resetCourseState: (state) => {
        state.isCategoryLoading = false;
        state.isCategoryError = false;
        state.isCategorySuccess = false;
        state.isCourseLoading = false;
        state.isCourseError = false;
        state.isCourseSuccess = false;
        state.isModuleError = false;
        state.isModuleLoading = false;
        state.isModuleSuccess = false;
        state.message = "";
        state.coursesData = [],
        state.tutorCoursesData = [],
        state.purchasedCoursesData = [],
        state.modulesData = [],
        state.singleCourse= null,
        state.reviewsData= [],
        state.commentsData= [],
        state.requestedTrades= [],
        state.receivedTrades= []
      },
      resetCheckout: (state) => {
        state.isCheckoutLoading = false;
        state.checkoutError = null;
        state.checkoutSession = null;
      },
      resetReviewsState: (state) => {
        state.isReviewsLoading = false;
        state.isReviewsError = null;
        state.isReviewsSuccess = null;
      }
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

      //Adding Course
      .addCase(addCourse.pending,(state)=>{
        state.isCourseLoading = true;
      })
      .addCase(addCourse.fulfilled,(state,action)=>{
        state.isCourseSuccess = true;
        state.isCourseLoading = false;
        state.message = action.payload;
      })
      .addCase(addCourse.rejected, (state, action)=>{
        state.isCourseError = true;
        state.message = action.payload;
      })

       //Fethcing Courses
       .addCase(fetchCourses.pending, (state)=>{
        state.isCourseLoading = true;
      })
      .addCase(fetchCourses.fulfilled,(state,action)=>{
        state.isCourseLoading = false;
        state.isCourseSuccess = true;
        state.coursesData = action.payload.results;
        state.currentPage = action.payload.current_page || 1;
        state.totalPages = action.payload.total_pages
        
      })
      .addCase(fetchCourses.rejected,(state, action)=>{
        state.isCourseError = true;
        state.message = action.payload;
      })

      //Fethcing Courses
      .addCase(fetchPurchasedCourses.pending, (state)=>{
        state.isCourseLoading = true;
      })
      .addCase(fetchPurchasedCourses.fulfilled,(state,action)=>{
        state.isCourseLoading = false;
        state.isCourseSuccess = true;
        state.purchasedCoursesData = action.payload.results;
        state.currentPage = action.payload.current_page || 1;
        state.totalPages = action.payload.total_pages
        
      })
      .addCase(fetchPurchasedCourses.rejected,(state, action)=>{
        state.isCourseError = true;
        state.message = action.payload;
      })

      //Fethcing Tutor Courses
      .addCase(fetchTutorCourses.pending, (state)=>{
        state.isCourseLoading = true;
      })
      .addCase(fetchTutorCourses.fulfilled,(state,action)=>{
        state.isCourseLoading = false;
        state.isCourseSuccess = true;
        state.tutorCoursesData = action.payload.results;
        state.currentPage = action.payload.current_page || 1;
        state.totalPages = action.payload.total_pages
        
      })
      .addCase(fetchTutorCourses.rejected,(state, action)=>{
        state.isCourseError = true;
        state.message = action.payload;
      })

      //Adding Module
      .addCase(addModule.pending,(state)=>{
        state.isModuleLoading = true;
      })
      .addCase(addModule.fulfilled,(state,action)=>{
        state.isModuleSuccess = true;
        state.isModuleLoading = false;
        state.message = action.payload;
      })
      .addCase(addModule.rejected, (state, action)=>{
        state.isModuleError = true;
        state.message = action.payload;
      })

      //Fethcing Modules
      .addCase(fetchModules.pending, (state)=>{
        state.isModuleLoading = true;
      })
      .addCase(fetchModules.fulfilled,(state,action)=>{
        state.isModuleLoading = false;
        state.isModuleSuccess = true;
        state.modulesData = action.payload;
      })
      .addCase(fetchModules.rejected,(state)=>{
        state.isModuleError = true;
        state.message = action.payload;
      })

      //Delete Module
      .addCase(deleteModule.pending,(state)=>{
        state.isModuleLoading = true;
      })
      .addCase(deleteModule.fulfilled,(state,action)=>{
        state.isModuleSuccess = true;
        state.isModuleLoading = false;
        state.message = action.payload;
      })
      .addCase(deleteModule.rejected, (state, action)=>{
        state.isModuleError = true;
        state.message = action.payload;
      })

      //Fethcing single course
      .addCase(fetchSingleCourse.pending, (state)=>{
        state.isCourseLoading = true;
      })
      .addCase(fetchSingleCourse.fulfilled,(state,action)=>{
        state.isCourseLoading = false;
        state.isCourseSuccess = true;
        state.singleCourse = action.payload;
      })
      .addCase(fetchSingleCourse.rejected,(state, action)=>{
        state.isCourseError = true;
        state.message = action.payload;
      })

      //Update Course
      .addCase(updateCourse.pending,(state)=>{
        state.isCourseLoading = true;
      })
      .addCase(updateCourse.fulfilled,(state,action)=>{
        state.isCourseSuccess = true;
        state.isCourseLoading = false;
        state.message = action.payload;
      })
      .addCase(updateCourse.rejected, (state, action)=>{
        state.isCourseError = true;
        state.message = action.payload;
      })

      //Delete Course
      .addCase(deleteCourse.pending,(state)=>{
        state.isCourseLoading = true;
      })
      .addCase(deleteCourse.fulfilled,(state,action)=>{
        state.isCourseSuccess = true;
        state.isCourseLoading = false;
        state.message = action.payload;
      })
      .addCase(deleteCourse.rejected, (state, action)=>{
        state.isCourseError = true;
        state.message = action.payload;
      })

      //Update Module
      .addCase(updateModule.pending,(state)=>{
        state.isModuleLoading = true;
      })
      .addCase(updateModule.fulfilled,(state,action)=>{
        state.isModuleSuccess = true;
        state.isModuleLoading = false;
        state.message = action.payload;
      })
      .addCase(updateModule.rejected, (state, action)=>{
        state.isModuleError = true;
        state.message = action.payload;
      })

      //Initiate Checkout
      .addCase(initiateCheckout.pending, (state) => {
        state.isCheckoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(initiateCheckout.fulfilled, (state, action) => {
        state.isCheckoutLoading = false;
        state.checkoutSession = action.payload;
        console.log(state.checkoutSession);
        
      })
      .addCase(initiateCheckout.rejected, (state, action) => {
        state.isCheckoutLoading = false;
        state.checkoutError = action.payload;
      })

      //Purchase Verification
      .addCase(verifyPurchaseStatus.fulfilled, (state, action) => {
        // Handle successful purchase verification
        // You might want to update course access status here
      })

      //Post Review
      .addCase(postReview.pending,(state)=>{
        state.isReviewsLoading = true;
      })
      .addCase(postReview.fulfilled,(state,action)=>{
        state.isReviewsSuccess = true;
        state.isReviewsLoading = false;
        state.message = action.payload;
      })
      .addCase(postReview.rejected, (state, action)=>{
        state.isReviewsError = true;
        state.message = action.payload;
      })

      //Fetch reviews
      .addCase(fetchReviews.pending, (state)=>{
        state.isReviewsLoading = true;
      })
      .addCase(fetchReviews.fulfilled,(state,action)=>{
        state.isReviewsLoading = false;
        state.isReviewsSuccess = true;
        state.reviewsData = action.payload;
      })
      .addCase(fetchReviews.rejected,(state)=>{
        state.isReviewsError = true;
        state.message = action.payload;
      })

      //Post Comment
      .addCase(postComment.pending,(state)=>{
        state.isCommentsLoading = true;
      })
      .addCase(postComment.fulfilled,(state,action)=>{
        state.isCommentsSuccess = true;
        state.isCommentsLoading = false;
        state.message = action.payload;
      })
      .addCase(postComment.rejected, (state, action)=>{
        state.isCommentsError = true;
        state.message = action.payload;
      })

      //Fetch comments
      .addCase(fetchComments.pending, (state)=>{
        state.isCommentsLoading = true;
      })
      .addCase(fetchComments.fulfilled,(state,action)=>{
        state.isCommentsLoading = false;
        state.isCommentsSuccess = true;
        state.commentsData = action.payload;
      })
      .addCase(fetchComments.rejected,(state)=>{
        state.isCommentsError = true;
        state.message = action.payload;
      })

      //Fetching trade requests
      .addCase(fetchTradeRequests.pending, (state)=>{
        state.isTradeLoading = true;
      })
      .addCase(fetchTradeRequests.fulfilled,(state,action)=>{
        state.isTradeLoading = false;
        state.requestedTrades = action.payload.requested_trade_requests;
        state.receivedTrades = action.payload.received_trade_requests;
      })
      .addCase(fetchTradeRequests.rejected,(state)=>{
        state.tradeError = action.payload
        state.isTradeLoading = false;
      })

      //Fetching trade requests
      .addCase(updateTradeRequest.pending, (state)=>{
        state.isTradeLoading = true;
      })
      .addCase(updateTradeRequest.fulfilled,(state,action)=>{
        state.isTradeLoading = false;
        state.message = action.payload
      })
      .addCase(updateTradeRequest.rejected,(state, action)=>{
        state.tradeError = action.payload
        state.isTradeLoading = false;
      })
       
    },
  });

export const { resetCourseState, resetCheckout } = courseSlice.actions;
  
export default courseSlice.reducer;