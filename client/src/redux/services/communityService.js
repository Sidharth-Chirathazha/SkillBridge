import axiosInstance from "../../api/axios.Config";

//Fetch Communities
export const fetchCommunities = async()=>{
    const response = await axiosInstance.get("/community/communities/");
    return response.data;
}

//Create Community
export const createCommunity = async(communityInfo)=>{

    // console.log("Sending FormData:", [...communityInfo.entries()]);
    
    const config = {
        requiresAuth: true,
        headers: {"Content-Type": "multipart/form-data"},
      };
    const response = await axiosInstance.post(
        "/community/communities/",
        communityInfo,
        config
    );
    return response.data;
}

//Join Community
export const joinCommunity = async(communityId)=>{
    const response = await axiosInstance.post(
        `/community/communities/${communityId}/join_community/`,
        {},
        { requiresAuth:true }
    );
    return response.data;
}


//Update Community
export const updateCommunity = async(id, updateData)=>{

    const config = {
        requiresAuth: true,
        headers: {} // Let Axios set the Content-Type for FormData
      };
    const response = await axiosInstance.patch(
        `/community/communities/${id}/`,
        updateData,
        config
    );
    return response.data;
}