import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Col, Form, Button, Alert } from 'react-bootstrap';
import api from '../../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/register', {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        navigate('/login');
      } else {
        setError(response.data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      setError('Registration failed');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Col md={6} className="mx-auto">
        <h2 className="text-center mb-4">Register</h2>
        <Form onSubmit={handleRegister}>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="email" className="mt-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="password" className="mt-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          {error && <Alert variant="danger" className="mt-2">{error}</Alert>}

          <Button type="submit" className="mt-4 w-100" variant="dark">
            Register
          </Button>

          <div className="text-center mt-2">
            Already have an account? <Link to="/login">Login here</Link>.
          </div>
        </Form>
      </Col>
    </Container>
  );
};

export default Register;
