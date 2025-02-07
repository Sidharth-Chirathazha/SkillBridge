import axiosInstance from "../../api/axios.Config";

//Admin Login
export const adminLogin = async(adminData)=>{
    const response = await axiosInstance.post("/admin/login/", adminData);
    return response.data;
}

//Admin Logout
export const adminLogout = async(tokenData)=>{
    const response = await axiosInstance.post(
        "/admin/logout/",
        tokenData, 
        { requiresAuth:true } 
    );
    return response.data
}

//Fetch Admin
export const fetchAdmin = async()=>{
    const response = await axiosInstance.get(
        "/admin/details/", 
        {requiresAuth: true}
    );
    return response.data
}

//Fetch Admin Tutors
export const fetchAdminTutors = async(id=null)=>{
    const endpoint = id ? `/admin/tutors/${id}/` : "/admin/tutors/";
    const response = await axiosInstance.get(
        endpoint, 
        {requiresAuth: true}
    );
    return response.data
}

//Authorize/Un-Authorize Tutor
export const updateTutorAuthorization = async (id, is_verified)=>{
    const response = await axiosInstance.patch(`/admin/tutors/${id}/`, 
        { is_verified }, 
        {requiresAuth:true}
    );
    return response.data
}

//Fetch Admin Students
export const fetchAdminStudents = async(id=null)=>{
    const endpoint = id ? `/admin/students/${id}/` : "/admin/students/";
    const response = await axiosInstance.get(
        endpoint, 
        {requiresAuth: true}
    );
    return response.data
}

// Block/Unblock Users(Tutors and Students)
export const updateUserActiveStatus = async (id, is_active)=>{
    const response = await axiosInstance.patch(`/admin/users/${id}/`, 
        { is_active }, 
        {requiresAuth:true}
    );
    return response.data
}

//Add Skill
export const addSkill = async(skillData)=>{
    const response = await axiosInstance.post(
        "/skills/", 
        skillData,
        {requiresAuth: true}
    );
    return response.data
}

//Delete Skill
export const deleteSkill = async(id)=>{
    const response = await axiosInstance.delete(
        `/skills/${id}/`, 
        {requiresAuth: true}
    );
    return response.data
}