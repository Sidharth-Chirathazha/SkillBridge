import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../redux/slices/authSlice';
import adminReducer from '../redux/slices/adminSlice';

const store = configureStore({

    reducer:{
        auth: authReducer,
        admin: adminReducer,
    },
});

export default store;