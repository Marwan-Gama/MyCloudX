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
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Invalid reset token");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword(token, password);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.error || "Failed to reset password");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Row className="w-100">
          <Col md={6} className="mx-auto">
            <Card>
              <Card.Body className="p-5 text-center">
                <h2>Invalid Reset Link</h2>
                <p className="text-muted mb-4">
                  The password reset link is invalid or has expired.
                </p>
                <Link to="/forgot-password" className="btn btn-primary">
                  Request New Reset Link
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Row className="w-100">
          <Col md={6} className="mx-auto">
            <Card>
              <Card.Body className="p-5 text-center">
                <h2>Password Reset Successfully</h2>
                <p className="text-muted mb-4">
                  Your password has been updated. Redirecting to login...
                </p>
                <Link to="/login" className="btn btn-primary">
                  Go to Login
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
                <h2>Reset Password</h2>
                <p className="text-muted">Enter your new password below</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
