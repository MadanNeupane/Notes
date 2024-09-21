import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/accounts/Login'
import Register from './pages/accounts/Register'
import Home from './pages/Home'
import Notes from './pages/home/Notes'
import NotFound from './pages/NotFound'
import './App.css'


const Logout = () => {
  localStorage.clear()
  return <Navigate to="/login" />
}


const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserName = localStorage.getItem('username');

    if (token) {
      setLoggedIn(true);
      setUserName(storedUserName);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login setLoggedIn={setLoggedIn} setUserName={setUserName} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<Home loggedIn={loggedIn} userName={userName} />} />
        <Route path="/notes" element={loggedIn ? <Notes /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
