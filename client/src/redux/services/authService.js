import axiosInstance from "../../api/axios.Config";

//Register User
export const registerUser = async(userData)=>{
    const response = await axiosInstance.post("/register/", userData);
    return response.data;

}

//Verify Otp
export const verifyOtp = async(otpData)=>{
    const response = await axiosInstance.post("/verify-otp/", otpData);
    return response.data
}

//User Login
export const loginUser = async(userData)=>{
    const response = await axiosInstance.post("/login/", userData);
    return response.data
}

//User Logout
export const logoutUser = async(tokenData)=>{
    const response = await axiosInstance.post("/logout/", tokenData);
    return response.data;
}

//Reset password OTP Request
export const requestResetPasswordOtp = async(emailData)=>{
    const response = await axiosInstance.post("/forgot-password/request-otp/", emailData);
    return response.data
}

//Reset password OTP Verification
export const verifyResetPasswordOtp = async(otpData)=>{
    const response = await axiosInstance.post("/forgot-password/verify-otp/", otpData);
    return response.data
}

//Reset Password
export const resetPassword = async(resetData)=>{
    const response = await axiosInstance.post("/forgot-password/update-password/", resetData);
    return response.data
}

//Fetch Users
export const fetchUser = async()=>{
    const response = await axiosInstance.get("/profile/", {
        requiresAuth: true,
    });
    return response.data
}