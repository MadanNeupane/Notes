import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Col, Form, Button } from 'react-bootstrap';

const Login = ({ setLoggedIn }) => {
  const [email, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    if (email === '' || password === '') {
      setEmailError('Please enter your credentials');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setLoggedIn(true);
        navigate('/');
      } else {
        setPasswordError('Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Col md={6} className="mx-auto">
        <h2 className="text-center mb-4">Login</h2>
        <Form onSubmit={handleLogin}>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmailInput(e.target.value)}
              isInvalid={emailError !== ''}
            />
            <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="password" className="mt-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isInvalid={passwordError !== ''}
            />
            <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" className="mt-4 w-100" variant="primary">
            Log In
          </Button>

          <div className="text-center mt-2">
            Don't have an account? <Link to="/register">Register here</Link>.
          </div>
        </Form>
      </Col>
    </Container>
  );
};

export default Login;
