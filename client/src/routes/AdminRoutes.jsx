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
import AdminCourseManagement from '../pages/admin/AdminCourseManagement'
import AdminCourseDetailView from '../pages/admin/AdminCourseDetailView'
import AdminWallet from '../pages/admin/AdminWallet'
import AdminLayout from '../components/admin/AdminLayout'
import AdminCommunityManagement from '../pages/admin/AdminCommunityManagement'
import NotFound from '../pages/NotFound'

const AdminRoutes = () => {
  return (
    <Routes>
        <Route path="login" element={<AdminLoginPage/>}/>
        <Route element={<AdminPrivateRoute/>} >
          <Route element={<AdminLayout/>}>
            <Route path="dashboard" element={<AdminDashboard/>}/>
            <Route path="tutors" element={<AdminTutorsManagement/>}/>
            <Route path="/tutors/:id" element={<AdminTutorDetailView/>}/>
            <Route path="students" element={<AdminStudentManagement/>}/>
            <Route path="/students/:id" element={<AdminStudentDetailView/>}/>
            <Route path="/contentManagement/" element={<AdminContentManagement/>}/>
            <Route path="/communities/" element={<AdminCommunityManagement/>}/>
            <Route path="courses" element={<AdminCourseManagement/>}/>
            <Route path="/courses/:id" element={<AdminCourseDetailView/>}/>
            <Route path="wallet" element={<AdminWallet/>}/>
          </Route>
        </Route>
        <Route path="*" element={<NotFound/>} />
    </Routes>
  )
}

export default AdminRoutes