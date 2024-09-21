import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/accounts/Login'
import Register from './pages/accounts/Register'
import Notes from './pages/home/Notes'
import NotFound from './pages/NotFound'


const Logout = () => {
  localStorage.clear()
  return <Navigate to="/login" />
}


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<Notes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
