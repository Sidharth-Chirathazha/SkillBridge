import React from 'react'
import TutorDashboard from '../pages/tutor/TutorDashboard'
import { Routes, Route } from "react-router-dom";
import UserPrivateRoute from './UserPrivateRoute';
import TutorProfile from '../pages/tutor/TutorProfile';
import CourseCreation from '../pages/tutor/CourseCreation';
import TutorCourses from '../pages/tutor/TutorCourses';

const TutorRoutes = () => {
  return (
    <Routes>
      <Route element={<UserPrivateRoute/>}>
        <Route path="dashboard" element={<TutorDashboard/>}/>
        <Route path="profile" element={<TutorProfile/>}/>
        <Route path="/courses/new" element={<CourseCreation/>}/>
        <Route path="/courses/edit/:courseId" element={<CourseCreation/>}/>
        <Route path="teaching" element={<TutorCourses/>}/>
      </Route>
    </Routes>
  )
}

export default TutorRoutes