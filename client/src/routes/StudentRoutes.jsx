import React from 'react'
import { Routes, Route } from "react-router-dom";
import StudentDashboard from '../pages/student/StudentDashboard'
import UserPrivateRoute from './UserPrivateRoute';
import StudentProfile from '../pages/student/StudentProfile';
import StudentCourses from '../pages/student/StudentCourses';
import StudentCourseDetailView from '../pages/student/StudentCourseDetailView';
import SuccessPage from '../pages/SuccessPage';
import StudentPurchasedCourses from '../pages/student/StudentPurchasedCourses';
import CoursePlayer from '../pages/CoursePlayer';
import StudentTutorDetailView from '../pages/student/StudentTutorDetailView';
import StudentTutors from '../pages/student/StudentTutors';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route element={<UserPrivateRoute/>}>
        <Route path="dashboard" element={<StudentDashboard/>}/>
        <Route path="profile" element={<StudentProfile/>}/>
        <Route path="courses" element={<StudentCourses/>}/>
        <Route path="/courses/:id" element={<StudentCourseDetailView/>}/>
        <Route path="/courses/success" element={<SuccessPage/>}/>
        <Route path="learning" element={<StudentPurchasedCourses/>}/>
        <Route path="/learning/:id" element={<CoursePlayer/>}/>
        <Route path="tutors" element={<StudentTutors/>}/>
        <Route path="/tutors/:id" element={<StudentTutorDetailView/>}/>
      </Route>
    </Routes>
  )
}

export default StudentRoutes