import React from "react";
import { Navbar, Nav, Dropdown, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { FiMenu, FiSun, FiMoon, FiUser, FiLogOut } from "react-icons/fi";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <div className="container-fluid">
        <Button
          variant="link"
          className="text-dark p-0 me-3"
          onClick={onMenuClick}
        >
          <FiMenu size={24} />
        </Button>

        <Navbar.Brand href="/dashboard" className="fw-bold text-primary">
          MyCloudX
        </Navbar.Brand>

        <Nav className="ms-auto">
          <Button
            variant="link"
            className="text-dark p-2"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
          </Button>

          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="text-dark p-2">
              <FiUser size={20} />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Header>
                <div className="fw-bold">{user?.name}</div>
                <div className="text-muted small">{user?.email}</div>
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <FiLogOut className="me-2" />
                Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </div>
    </Navbar>
  );
};

export default Header;
