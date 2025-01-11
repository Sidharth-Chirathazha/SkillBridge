import { Routes, Route } from "react-router-dom";
import RegistrationPage from "../pages/auth/RegistrationPage";
import LoginPage from "../pages/auth/LoginPage";


import React from 'react'

const AuthRoutes = () => {
  return (
    <Routes>
        <Route path="/register" element={<RegistrationPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
    </Routes>
  )
}

export default AuthRoutes