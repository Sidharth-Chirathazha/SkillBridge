import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthRoutes from './routes/AuthRoutes'
import StudentRoutes from './routes/StudentRoutes'
import TutorRoutes from './routes/TutorRoutes'
import {Toaster} from 'react-hot-toast'
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import AdminRoutes from './routes/AdminRoutes'
import { GoogleOAuthProvider } from '@react-oauth/google'
import theme from './assets/styles/theme'
import { ThemeProvider, CssBaseline } from '@mui/material';
import UserPrivateRoute from './routes/UserPrivateRoute'
import VideoCallPage from './pages/VideoCallPage'
import NotFound from './pages/NotFound'


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const toastIcons = {
  success: <CheckCircle size={18} color="#10B981" />,
  error: <XCircle size={18} color="#EF4444" />,
  loading: <Loader size={18} color="#3B82F6" className="animate-spin" />
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          {/* Toaster configuration */}
          <Toaster
              position="top-right"
              toastOptions={{
                duration: 2000,
                style: {
                  background: '#FFFFFF',
                  color: '#333333',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                },
                success: {
                  icon: toastIcons.success,
                },
                error: {
                  icon: toastIcons.error,
                },
                loading: {
                  icon: toastIcons.loading,
                },
              }}
              containerStyle={{
                top: 16,
                right: 16,
              }}
              transition={{
                enter: { 
                  opacity: 0, 
                  transform: 'translateY(-10px)', 
                  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' 
                },
                leave: { 
                  opacity: 0, 
                  transform: 'translateY(-10px)', 
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)' 
                },
              }}
            />
            <Routes>
              <Route path="/*" element={<AuthRoutes />} />
              <Route path="/student/*" element={<StudentRoutes />} />
              <Route path="/tutor/*" element={<TutorRoutes />} />
              <Route path="/admin/*" element={<AdminRoutes/>}/>
              <Route element={<UserPrivateRoute />}>
                  <Route path="/video-call/:roomId" element={<VideoCallPage />} />
              </Route>
              <Route path="*" element={<NotFound/>} />
            </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  )
}

export default App
