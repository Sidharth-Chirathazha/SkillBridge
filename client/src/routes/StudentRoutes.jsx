import React from 'react'
import { Routes, Route } from "react-router-dom";
import StudentDashboard from '../pages/student/StudentDashboard'
import UserPrivateRoute from './UserPrivateRoute';
import StudentProfile from '../pages/student/StudentProfile';
import SuccessPage from '../pages/SuccessPage';
import CoursePlayer from '../pages/CoursePlayer';
import StudentTutorDetailView from '../pages/student/StudentTutorDetailView';
import StudentTutors from '../pages/student/StudentTutors';
import UserLayout from '../components/common/UserLayout';
import CourseList from '../pages/CourseList';
import CourseDetailPage from '../pages/CourseDetailPage';
import CoursesOwned from '../pages/CoursesOwned';
import CommunitiesList from '../pages/CommunitiesList';
import CommunityChatPage from '../pages/CommunityChatPage';
import NotificationsPage from '../pages/NotificationsPage';
import { NotificationProvider } from '../context_providers/NotificationProvider';
import OneToOneChatPage from '../pages/OneToOneChatPage';
import NotFound from '../pages/NotFound';

const StudentRoutes = () => {
  return (
    <NotificationProvider>
      <Routes>
        <Route element={<UserPrivateRoute/>}>
            <Route element={<UserLayout/>}>
              <Route path="dashboard" element={<StudentDashboard/>}/>
              <Route path="profile" element={<StudentProfile/>}/>
              <Route path="courses" element={<CourseList/>}/>
              <Route path="/courses/:id" element={<CourseDetailPage/>}/>
              <Route path="learning" element={<CoursesOwned/>}/>
              <Route path="/learning/:id" element={<CoursePlayer/>}/>
              <Route path="/chatroom/:chatRoomId" element={<OneToOneChatPage/>}/>
              <Route path="/chatroom" element={<OneToOneChatPage/>}/>
              <Route path="tutors" element={<StudentTutors/>}/>
              <Route path="/tutors/:id" element={<StudentTutorDetailView/>}/>
              <Route path="communities" element={<CommunitiesList/>}/>
              <Route path="/communities/:communityId/chat" element={<CommunityChatPage/>}/>
              <Route path="notifications" element={<NotificationsPage/>}/>
            </Route>
          <Route path="/courses/success" element={<SuccessPage/>}/>
        </Route>
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </NotificationProvider>
  )
}

export default StudentRoutes