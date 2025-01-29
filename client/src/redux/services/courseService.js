import axiosInstance from "../../api/axios.Config";


//Categories Fetch
export const fetchCategories = async()=>{
    const response = await axiosInstance.get("/courses/categories/");
    return response.data;
}

//Add category
export const addCategory = async(categoryInfo)=>{
    const response = await axiosInstance.post(
        "/courses/categories/",
        categoryInfo,
        { requiresAuth:true }
    );
    return response.data;
}

//Update category
export const updateCategory = async(id, updateData)=>{
    const response = await axiosInstance.patch(
        `/courses/categories/${id}/`,
        updateData,
        { requiresAuth:true }
    );
    return response.data;
}

//Delete category
export const deleteCategory = async(id)=>{
    const response = await axiosInstance.delete(
        `/courses/categories/${id}/`,
        { requiresAuth:true }
    );
    return response.data;
}