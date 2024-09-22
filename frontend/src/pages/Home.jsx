import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const Home = ({ loggedIn }) => {
  const userName = localStorage.getItem('username');

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="text-center">
        <Col md={12}>
          <h1 className="display-4">Welcome to LevoNotes!</h1>
          <p className="lead">Keep track of your tasks and never miss a reminder.</p>

          {loggedIn ? (
            <>
              <Card className="mt-4">
                <Card.Body>
                  <h3>Logged in as <strong>{userName}</strong></h3>
                  <div className="mt-3">
                    <Link to="/notes">
                      <Button variant="dark" className="mx-2">View Notes</Button>
                    </Link>
                    <Link to="/logout">
                      <Button variant="danger" className="mx-2">Logout</Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </>
          ) : (
            <div className="mt-4">
              <Link to="/login">
                <Button variant="dark" className="mx-2">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" className="mx-2">Register</Button>
              </Link>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
