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
    const response = await axiosInstance.post(
        "/logout/", 
        tokenData,
        { requiresAuth:true }
    );
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
    const response = await axiosInstance.get(
        "/profile/", 
        {requiresAuth: true}
    );
    return response.data
}

//Update User Profile
export const updateUser = async (formData) => {
    const config = {
      requiresAuth: true,
      headers: {} // Let Axios set the Content-Type for FormData
    };
    
    return await axiosInstance.put("/profile/complete/", formData, config);
  };

// Google Authentication
export const googleLogin = async(token, role)=>{
    const response = await axiosInstance.post("/google-login/", {
        token,
        role,
    });
    return response.data;
}

//Fetch Skills
export const fetchSkills = async()=>{
    const response = await axiosInstance.get(
        "/skills/", 
        {requiresAuth: true}
    );
    return response.data
}


//Post Tutor review
export const postTutorReview = async(reviewInfo)=>{
    const response = await axiosInstance.post(
        "/tutor/tutor-reviews/",
        reviewInfo,
        { requiresAuth:true }
    );
    return response.data;
}

//Fetch Tutor Review
export const fetchTutorReviews = async(tutorId)=>{
    const response = await axiosInstance.get( `/tutor/tutor-reviews/?tutor_id=${tutorId}`);
    return response.data;
}

  