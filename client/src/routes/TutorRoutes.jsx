import React from 'react'
import TutorDasboard from '../pages/tutor/TutorDashboard'
import { Routes, Route } from "react-router-dom";
import UserPrivateRoute from './UserPrivateRoute';

const TutorRoutes = () => {
  return (
    <Routes>
      <Route element={<UserPrivateRoute/>}>
        <Route path="dashboard" element={<TutorDasboard/>}/>
      </Route>
    </Routes>
  )
}

export default TutorRoutes