import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import FileManager from "../components/FileManager";
import Header from "../components/Header";

const Dashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="dashboard">
      <Header onMenuClick={toggleSidebar} />

      <Container fluid className="p-0">
        <Row className="g-0">
          <Col>
            <Sidebar collapsed={sidebarCollapsed} />
          </Col>
          <Col className="main-content">
            <Routes>
              <Route path="/" element={<FileManager />} />
              <Route path="/files" element={<FileManager />} />
              <Route path="/shared" element={<FileManager />} />
              <Route path="/trash" element={<FileManager />} />
            </Routes>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
