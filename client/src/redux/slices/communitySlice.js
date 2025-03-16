import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import * as communityService from "../services/communityService"
import toast from "react-hot-toast";

const handleApiError = (error, thunkAPI)=>{
    const message = error.response?.data?.detail || error.response?.data?.error || error.message;
    toast.error(message)
    return thunkAPI.rejectWithValue(message);
  }


  export const fetchCommunities = createAsyncThunk(
    'community/fetchCommunities',
    async ({page,pageSize,search}, thunkAPI) => {
      try {
        return await communityService.fetchCommunities(page,pageSize,search);
      } catch (error) {
        return handleApiError(error, thunkAPI);
      }
    }
  );

  export const createCommunity = createAsyncThunk(
    'community/createCommunity',
    async (data, thunkAPI) => {
      try {
        return await communityService.createCommunity(data);
      } catch (error) {
        return handleApiError(error, thunkAPI);
      }
    }
  );
  
  export const joinCommunity = createAsyncThunk(
    'community/joinCommunity',
    async (communityId, thunkAPI) => {
      try {
        return await communityService.joinCommunity(communityId);
      } catch (error) {
        return handleApiError(error, thunkAPI);
      }
    }
  );

  export const updateCommunity = createAsyncThunk(
    'community/updateCommunity',
    async ({id, updateData}, thunkAPI) => {
      try {
        return await communityService.updateCommunity(id, updateData);
      } catch (error) {
        return handleApiError(error, thunkAPI);
      }
    }
  );



  const communitySlice = createSlice({
      name: "community",
      initialState: {
        communities : [],
        isCommunityLoading: false,
        isCommunityError : false,
        isCommunitySuccess: false,
        communityError: null,
        currentPage: 1,
        totalPages: 1
       
      },
      reducers: {
        resetCommunityState: (state) => {
          state.isCommunityLoading = false;
          state.isCommunityError = null;
          state.isCommunitySuccess = null;
        }
      },
      extraReducers: (builder) => {
        builder
  
        //Fethcing Communities
        .addCase(fetchCommunities.pending, (state)=>{
          state.isCommunityLoading = true;
        })
        .addCase(fetchCommunities.fulfilled,(state,action)=>{
          state.isCommunityLoading = false;
          state.isCommunitySuccess = true;
          state.communities = action.payload.results;
          state.currentPage = action.payload.current_page || 1;
          state.totalPages = action.payload.total_pages
        })
        .addCase(fetchCommunities.rejected,(state)=>{
          state.isCommunityError = true;
          state.communityError = action.payload;
        })

        .addCase(joinCommunity.fulfilled,(state, action)=>{
          console.log(action.payload);
          const {communityId, userId} = action.payload
          const community = state.communities.find(c=>c.id === communityId)
          if (community) {
            // Update community members
            community.members.push({ user: userId });
            community.members_count += 1;
        }
        toast.success("You have successfully joined this community")
          
        })
  
         
      },
    });
  
  export const { resetCommunityState } = communitySlice.actions;
    
  export default communitySlice.reducer;