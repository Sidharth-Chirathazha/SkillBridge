import React from 'react'
import TutorDashboard from '../pages/tutor/TutorDashboard'
import { Routes, Route } from "react-router-dom";
import UserPrivateRoute from './UserPrivateRoute';
import TutorProfile from '../pages/tutor/TutorProfile';
import CourseCreation from '../pages/tutor/CourseCreation';
import TutorWallet from '../pages/tutor/TutorWallet';
import UserLayout from '../components/common/UserLayout';
import TutorTeaching from '../pages/tutor/TutorTeaching';
import CourseList from '../pages/CourseList';
import CourseDetailPage from '../pages/CourseDetailPage';
import CoursesOwned from '../pages/CoursesOwned';
import CoursePlayer from '../pages/CoursePlayer';
import SuccessPage from '../pages/SuccessPage';
import CommunitiesList from '../pages/CommunitiesList';
import CommunityChatPage from '../pages/CommunityChatPage';


const TutorRoutes = () => {
  return (
    <Routes>
      <Route element={<UserPrivateRoute/>}>
        <Route element={<UserLayout/>}>
          <Route path="dashboard" element={<TutorDashboard/>}/>
          <Route path="profile" element={<TutorProfile/>}/>
          <Route path="courses" element={<CourseList/>}/>
          <Route path="learning" element={<CoursesOwned variant='tutor'/>}/>
          <Route path="/learning/:id" element={<CoursePlayer/>}/>
          <Route path="/courses/:id" element={<CourseDetailPage/>}/>
          <Route path="/teaching/new" element={<CourseCreation/>}/>
          <Route path="/teaching/edit/:courseId" element={<CourseCreation/>}/>
          <Route path="teaching" element={<TutorTeaching/>}/>
          <Route path="wallet" element={<TutorWallet/>}/>
          <Route path="communities" element={<CommunitiesList/>}/>
          <Route path="/communities/:communityId/chat" element={<CommunityChatPage/>}/>
        </Route>
        <Route path="/courses/success" element={<SuccessPage/>}/>
      </Route>
    </Routes>
  )
}

export default TutorRoutes