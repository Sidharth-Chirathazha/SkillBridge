import './App.css'
import { BrowserRouter } from 'react-router-dom'
import AuthRoutes from './routes/AuthRoutes'
import StudentRoutes from './routes/StudentRoutes'
import TutorRoutes from './routes/TutorRoutes'


function App() {
  return (
    <BrowserRouter>
        <AuthRoutes/>
        <StudentRoutes/>
        <TutorRoutes/>
    </BrowserRouter>
  )
}

export default App
