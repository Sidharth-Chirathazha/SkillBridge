import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../redux/slices/authSlice';
import adminReducer from '../redux/slices/adminSlice';
import courseReducer from '../redux/slices/courseSlice';
import communityReducer from '../redux/slices/communitySlice';
import storage from "redux-persist/lib/storage"; // Uses localStorage by default
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";



const authPersistConfig = {
    key: "auth",
    storage,
    blacklist: [
        "isLoading",
        "isError",
        "isUpdateError",
        "isSuccess",
        "isGoogleError",
        "isGoogleSuccess",
        "isTutorReviewsLoading",
        "isTutorReviewsError",
        "isTutorReviewsSuccess",
        "isWalletLoading",
        "isWalletSuccess",
        "isWalletError",
        "isTransactionsLoading",
        "isTransactionsError",
        "isTransactionsSuccess",
        "message",
        "otpRequestSuccess",
        "otpVerifySuccess",
        "passwordResetSuccess",
    ],
};

const coursePersistConfig = {
    key: "course",
    storage,
    blacklist: [
        "isCategoryLoading",
        "isCategoryError",
        "isCategorySuccess",
        "isCourseLoading",
        "isCourseError",
        "isCourseSuccess",
        "isModuleLoading",
        "isModuleError",
        "isModuleSuccess",
        "isReviewsLoading",
        "isReviewsError",
        "isReviewsSuccess",
        "isCommentsLoading",
        "isCommentsSuccess",
        "isCommentsError",
        "tradeError",
        "message",
    ],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCourseReducer = persistReducer(coursePersistConfig, courseReducer);

const store = configureStore({

    reducer:{
        auth: persistedAuthReducer,
        admin: adminReducer,
        course: persistedCourseReducer,
        community: communityReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
              },
    }),
});

export const persistor = persistStore(store);

export default store;