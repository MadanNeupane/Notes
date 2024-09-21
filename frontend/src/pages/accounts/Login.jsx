import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = ({ setLoggedIn, setEmail }) => {
  const [email, setEmailInput] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const navigate = useNavigate()

const handleLogin = async (e) => {
  e.preventDefault();
  setEmailError("");
  setPasswordError("");

  if (email === "" || password === "") {
    setEmailError("Please enter your credentials");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      setLoggedIn(true);
      navigate("/");
    } else {
      setPasswordError("Invalid credentials");
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
};

  return (
    <div className="main-container">
      <div className="title-container">Login</div>
      <form onSubmit={handleLogin}>
        <div className="input-container">
          <input
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmailInput(e.target.value)}
            className="input-box"
            type="email"
          />
          <label className="error-label">{emailError}</label>
        </div>
        <div className="input-container">
          <input
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="input-box"
            type="password"
          />
          <label className="error-label">{passwordError}</label>
        </div>
        <div className="input-container">
          <button type="submit" className="input-button">
            Log in
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
