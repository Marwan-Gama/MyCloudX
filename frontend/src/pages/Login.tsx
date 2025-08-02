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
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        navigate("/dashboard");
      } else {
        setError(response.error || "Login failed");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100">
        <Col md={6} className="mx-auto">
          <Card>
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2>Welcome Back</h2>
                <p className="text-muted">Sign in to your MyCloudX account</p>
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

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  {loading ? "Signing In..." : "Sign In"}
                </Button>

                <div className="text-center">
                  <Link to="/forgot-password" className="text-decoration-none">
                    Forgot your password?
                  </Link>
                </div>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-decoration-none">
                    Sign up
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
