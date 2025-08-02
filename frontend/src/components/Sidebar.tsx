import React, { useState, useEffect } from "react";
import { Nav, Card, ProgressBar } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiFolder, FiShare2, FiTrash2, FiCloud } from "react-icons/fi";
import { filesAPI } from "../services/api";
import { StorageUsage } from "../types";

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);

  useEffect(() => {
    const fetchStorageUsage = async () => {
      try {
        const response = await filesAPI.getStorageUsage();
        if (response.success && response.data) {
          setStorageUsage(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch storage usage:", error);
      }
    };

    fetchStorageUsage();
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Home", icon: FiHome },
    { path: "/dashboard/files", label: "My Files", icon: FiFolder },
    { path: "/dashboard/shared", label: "Shared", icon: FiShare2 },
    { path: "/dashboard/trash", label: "Trash", icon: FiTrash2 },
  ];

  const getStoragePercentage = () => {
    if (!storageUsage) return 0;
    // Assuming 1GB free storage
    const maxStorage = 1024 * 1024 * 1024; // 1GB in bytes
    return Math.min((storageUsage.totalSize / maxStorage) * 100, 100);
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-content">
        <Nav className="flex-column">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                className={`d-flex align-items-center ${
                  isActive ? "active" : ""
                }`}
              >
                <Icon size={20} className="me-3" />
                {!collapsed && <span>{item.label}</span>}
              </Nav.Link>
            );
          })}
        </Nav>

        {!collapsed && storageUsage && (
          <Card className="mt-4">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <FiCloud size={16} className="me-2" />
                <small className="text-muted">Storage</small>
              </div>
              <ProgressBar
                now={getStoragePercentage()}
                className="mb-2"
                variant={getStoragePercentage() > 80 ? "danger" : "primary"}
              />
              <small className="text-muted">
                {storageUsage.totalSizeMB.toFixed(1)} MB used
              </small>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
