import React from 'react'
import TutorDasboard from '../pages/tutor/TutorDashboard'
import { Routes, Route } from "react-router-dom";
import UserPrivateRoute from './UserPrivateRoute';
import TutorProfile from '../pages/tutor/TutorProfile';

const TutorRoutes = () => {
  return (
    <Routes>
      <Route element={<UserPrivateRoute/>}>
        <Route path="dashboard" element={<TutorDasboard/>}/>
        <Route path="profile" element={<TutorProfile/>}/>
      </Route>
    </Routes>
  )
}

export default TutorRoutes