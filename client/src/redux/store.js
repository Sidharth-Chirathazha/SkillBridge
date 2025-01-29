import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../redux/slices/authSlice';
import adminReducer from '../redux/slices/adminSlice';
import courseReducer from '../redux/slices/courseSlice';

const store = configureStore({

    reducer:{
        auth: authReducer,
        admin: adminReducer,
        course: courseReducer,
    },
});

export default store;