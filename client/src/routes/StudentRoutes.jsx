import React from 'react'
import { Routes, Route } from "react-router-dom";
import StudentDashboard from '../pages/student/StudentDashboard'

const StudentRoutes = () => {
  return (
    <Routes>
        <Route path="/student/dashboard" element={<StudentDashboard/>}/>
    </Routes>
  )
}

export default StudentRoutes