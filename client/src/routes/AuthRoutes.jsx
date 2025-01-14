import { Routes, Route } from "react-router-dom";
import RegistrationPage from "../pages/auth/RegistrationPage";
import LoginPage from "../pages/auth/LoginPage";
import LandingPage from "../pages/auth/LandingPage";


import React from 'react'

const AuthRoutes = () => {
  return (
    <Routes>
        <Route path="/" element={<LandingPage/>}/> 
        <Route path="/register" element={<RegistrationPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
    </Routes>
  )
}

export default AuthRoutes