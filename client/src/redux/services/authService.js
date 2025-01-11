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