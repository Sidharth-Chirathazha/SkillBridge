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

const StudentRoutes = () => {
  return (
    <Routes>
      <Route element={<UserPrivateRoute/>}>
        <Route element={<UserLayout/>}>
          <Route path="dashboard" element={<StudentDashboard/>}/>
          <Route path="profile" element={<StudentProfile/>}/>
          <Route path="courses" element={<CourseList/>}/>
          <Route path="/courses/:id" element={<CourseDetailPage/>}/>
          <Route path="learning" element={<CoursesOwned/>}/>
          <Route path="/learning/:id" element={<CoursePlayer/>}/>
          <Route path="tutors" element={<StudentTutors/>}/>
          <Route path="/tutors/:id" element={<StudentTutorDetailView/>}/>
        </Route>
        <Route path="/courses/success" element={<SuccessPage/>}/>
      </Route>
    </Routes>
  )
}

export default StudentRoutes