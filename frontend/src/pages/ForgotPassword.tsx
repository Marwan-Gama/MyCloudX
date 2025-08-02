import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || "Failed to send reset email");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Row className="w-100">
          <Col md={6} className="mx-auto">
            <Card>
              <Card.Body className="p-5 text-center">
                <h2>Check Your Email</h2>
                <p className="text-muted mb-4">
                  We've sent a password reset link to {email}
                </p>
                <Link to="/login" className="btn btn-primary">
                  Back to Login
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100">
        <Col md={6} className="mx-auto">
          <Card>
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2>Forgot Password</h2>
                <p className="text-muted">
                  Enter your email address and we'll send you a link to reset
                  your password
                </p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </Form>

              <div className="text-center">
                <Link to="/login" className="text-decoration-none">
                  Back to Login
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
