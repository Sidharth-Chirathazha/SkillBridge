import React from 'react'
import TutorDasboard from '../pages/tutor/TutorDashboard'
import { Routes, Route } from "react-router-dom";

const TutorRoutes = () => {
  return (
    <Routes>
        <Route path="/tutor/dashboard" element={<TutorDasboard/>}/>
    </Routes>
  )
}

export default TutorRoutes