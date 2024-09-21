import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row>
        <Col>
          <h1 className="display-3">404</h1>
          <h2>Page Not Found</h2>
          <p className="lead">
            Oops! The page you're looking for doesn't exist.
          </p>

          <Link to="/">
            <Button variant="dark">Go Home</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
