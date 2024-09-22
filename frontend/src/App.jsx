import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/accounts/Login';
import Register from './pages/accounts/Register';
import Home from './pages/Home';
import Notes from './pages/home/Notes';
import NotFound from './pages/NotFound';
import api from './api';

const Logout = () => {
  localStorage.clear();
  return <Navigate to="/login" />;
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      api.get('/me')
        .then(response => {
          setLoggedIn(true);
          setUserName(response.data.username);
        })
        .catch(error => {
          console.error('Error fetching user data', error);
          handleLogout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setUserName('');
  };

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
        <Route path="/notes" element={loggedIn ? <Notes userName={userName} /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
