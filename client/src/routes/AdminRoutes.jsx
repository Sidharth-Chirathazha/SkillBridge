import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminLoginPage from '../pages/admin/AdminLoginPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminPrivateRoute from './AdminPrivateRoute'
import AdminTutorsManagement from '../pages/admin/AdminTutorsManagement'
import AdminTutorDetailView from '../pages/admin/AdminTutorDetailView'
import AdminStudentManagement from '../pages/admin/AdminStudentManagement'
import AdminStudentDetailView from '../pages/admin/AdminStudentDetailView'
import AdminContentManagement from '../pages/admin/AdminContentManagement'

const AdminRoutes = () => {
  return (
    <Routes>
        <Route path="login" element={<AdminLoginPage/>}/>
        <Route element={<AdminPrivateRoute/>} >
          <Route path="dashboard" element={<AdminDashboard/>}/>
          <Route path="tutors" element={<AdminTutorsManagement/>}/>
          <Route path="/tutors/:id" element={<AdminTutorDetailView/>}/>
          <Route path="students" element={<AdminStudentManagement/>}/>
          <Route path="/students/:id" element={<AdminStudentDetailView/>}/>
          <Route path="/contentManagement/" element={<AdminContentManagement/>}/>
        </Route>
    </Routes>
  )
}

export default AdminRoutes