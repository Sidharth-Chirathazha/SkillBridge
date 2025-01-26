import React from 'react'
import { Routes, Route } from "react-router-dom";
import StudentDashboard from '../pages/student/StudentDashboard'
import UserPrivateRoute from './UserPrivateRoute';
import StudentProfile from '../pages/student/StudentProfile';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route element={<UserPrivateRoute/>}>
        <Route path="dashboard" element={<StudentDashboard/>}/>
        <Route path="profile" element={<StudentProfile/>}/>
      </Route>
    </Routes>
  )
}

export default StudentRoutes