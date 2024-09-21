import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await response.json()

      if (response.ok) {
        navigate('/login')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration Error:', error)
    }
  }

  return (
    <div className="main-container">
      <div className="title-container">Register</div>
      <form onSubmit={handleRegister}>
        <div className="input-container">
          <input
            value={username}
            placeholder="Enter your username"
            onChange={(e) => setUsername(e.target.value)}
            className="input-box"
            type="text"
          />
        </div>
        <div className="input-container">
          <input
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="input-box"
            type="email"
          />
        </div>
        <div className="input-container">
          <input
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="input-box"
            type="password"
          />
        </div>
        <div className="input-container">
          <button type="submit" className="input-button">
            Register
          </button>
        </div>
        <div className="error-label">{error}</div>
      </form>
    </div>
  )
}

export default Register