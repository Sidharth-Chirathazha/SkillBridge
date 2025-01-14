import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthRoutes from './routes/AuthRoutes'
import StudentRoutes from './routes/StudentRoutes'
import TutorRoutes from './routes/TutorRoutes'
import {Toaster} from 'react-hot-toast'



function App() {
  return (
    <BrowserRouter>
      {/* Toaster configuration */}
      <Toaster
          position="top-right"
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
        </Routes>
    </BrowserRouter>
  )
}

export default App
