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

//Add course
export const addCourse = async(courseInfo)=>{

    const config = {
        requiresAuth: true,
        headers: {} // Let Axios set the Content-Type for FormData
      };
    const response = await axiosInstance.post(
        "/courses/course/",
        courseInfo,
        config
    );
    return response.data;
}

//Fetch courses
export const fetchCourses = async(page, pageSize, status=null, user=null)=>{
    let url = `/courses/course/?page=${page}&page_size=${pageSize}`;

    if (status){
        url = `/courses/course/?page=${page}&page_size=${pageSize}&status=${status}`;
    }
    const config = user ? {
       requiresAuth:true
    } : {};

    const response = await axiosInstance.get(url,config);
    return response.data;
}

//Fetch tutor courses
export const fetchTutorCourses = async(tutorId, page=null, pageSize=null, status=null)=>{
    console.log(tutorId);
    
    let params = new URLSearchParams();
    params.append("tutor_id", tutorId);

    if (page) params.append("page", page);
    if (pageSize) params.append("page_size", pageSize);
    if (status) params.append("status", status);

    const url = `/courses/course/?${params.toString()}`;
    
    const response = await axiosInstance.get(url);
    return response.data;
}

//Fetch courses
export const fetchPurchasedCourses = async(page, pageSize)=>{
    const response = await axiosInstance.get(`/courses/purchased-courses/?page=${page}&page_size=${pageSize}`,
        {requiresAuth:true}
    );
    return response.data;
}


//Fetch Single Course
export const fetchSingleCourse = async(id)=>{
    const response = await axiosInstance.get(`/courses/course/${id}/`);
    return response.data;
}


//Update Course
export const updateCourse = async(id, updateData)=>{

    console.log(id);
    
    const config = {
        requiresAuth: true,
        headers: {} // Let Axios set the Content-Type for FormData
      };
    const response = await axiosInstance.patch(
        `/courses/course/${id}/`,
        updateData,
        config
    );
    return response.data
}

//Delete Course
export const deleteCourse = async(id)=>{
    const response = await axiosInstance.delete(
        `/courses/course/${id}/`,
        { requiresAuth:true }
    );
    return response.data;
}

//Add Module
export const addModule = async(moduleInfo)=>{

    const config = {
        requiresAuth: true,
        headers: {} 
      };
    const response = await axiosInstance.post(
        "/courses/modules/",
        moduleInfo,
        config
    );
    return response.data;
}

//Fetch Modules
export const fetchModules = async(courseId=null)=>{
    const response = await axiosInstance.get("/courses/modules/",{
        params: courseId?{course_id:courseId} : {},
    });
    return response.data;
}

//Update Module
export const updateModule = async(id, updateData)=>{

    const config = {
        requiresAuth: true,
        headers: {} 
      };
    const response = await axiosInstance.patch(
        `/courses/modules/${id}/`,
        updateData,
        config
    );
    return response.data;
}


//Delete Module
export const deleteModule = async(id)=>{
    const response = await axiosInstance.delete(
        `/courses/modules/${id}/`,
        { requiresAuth:true }
    );
    return response.data;
}

//Stripe Checkout
export const createCheckoutSession = async(courseId)=>{
    console.log(courseId);
    
    const response = await axiosInstance.post("/courses/create-checkout-session/",
        {course_id: courseId},
        {requiresAuth:true}
    );
    return response.data;
}

//Verify Purchase
export const verifyPurchase = async(sessionId)=>{
    const response = await axiosInstance.post("/courses/verify-purchase/",
        {session_id: sessionId},
        {requiresAuth:true}
    );
    return response.data;
}

//Post review
export const postReview = async(reviewInfo)=>{
    const response = await axiosInstance.post(
        "/courses/reviews/",
        reviewInfo,
        { requiresAuth:true }
    );
    return response.data;
}

//Fetch Course Review
export const fetchReviews = async(courseSlug)=>{
    const response = await axiosInstance.get( `/courses/reviews/?course_slug=${courseSlug}`);
    return response.data;
}


//Post review
export const postComment = async(courseId, newComment, parentId)=>{
    const requestData = { course: courseId, content: newComment };
    if (parentId) {
        requestData.parent = parentId;  // Only include if it's a reply
    }
    const response = await axiosInstance.post(
        "/courses/comments/",
        requestData,
        { requiresAuth:true }
    );
    return response.data;
}

//Fetch Comments
export const fetchComments = async(courseId)=>{
    const response = await axiosInstance.get( `/courses/comments/?course=${courseId}`,
        { requiresAuth:true }
    );
    return response.data;
}

//Sending Trade Request
export const sendTradeRequest = async(requestData)=>{
    const response = await axiosInstance.post("/courses/course-trades/",
        requestData,
        {requiresAuth:true}
    );
    return response.data
}

//Sending Trade Request
export const updateTradeRequest = async(tradeId,action)=>{
    let url = `/courses/course-trades/${tradeId}`
    if(action === 'accept'){
        url = `/courses/course-trades/${tradeId}/accept_trade/`
    }
    if(action === 'decline'){
        url = `/courses/course-trades/${tradeId}/decline_trade/`
    }
    const response = await axiosInstance.post(url,
        {requiresAuth:true}
    );
    return response.data
}


//Fetch Trade Requests
export const fetchTradeRequests = async()=>{
    const response = await axiosInstance.get("/courses/course-trades/",
        {requiresAuth:true}
    );
    return response.data
}