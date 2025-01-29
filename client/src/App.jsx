import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthRoutes from './routes/AuthRoutes'
import StudentRoutes from './routes/StudentRoutes'
import TutorRoutes from './routes/TutorRoutes'
import {Toaster} from 'react-hot-toast'
import AdminRoutes from './routes/AdminRoutes'
import { GoogleOAuthProvider } from '@react-oauth/google'
import theme from './assets/styles/theme'
import { ThemeProvider, CssBaseline } from '@mui/material';


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          {/* Toaster configuration */}
          <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '8px',
                },
                success: {
                  style: {
                    background: '#10B981',
                  },
                  icon: '✓',
                },
                error: {
                  style: {
                    background: '#EF4444',
                  },
                  icon: '✕',
                },
                loading: {
                  style: {
                    background: '#3B82F6',
                  },
                },
              }}
            />
            <Routes>
              <Route path="/*" element={<AuthRoutes />} />
              <Route path="/student/*" element={<StudentRoutes />} />
              <Route path="/tutor/*" element={<TutorRoutes />} />
              <Route path="/admin/*" element={<AdminRoutes/>}/>
            </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  )
}

export default App
