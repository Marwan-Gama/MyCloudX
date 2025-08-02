import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Card,
  Badge,
  Dropdown,
  Pagination,
  Alert,
} from "react-bootstrap";
import {
  FiPlus,
  FiSearch,
  FiGrid,
  FiList,
  FiMoreVertical,
  FiDownload,
  FiShare,
  FiTrash2,
  FiRotateCcw,
  FiEye,
} from "react-icons/fi";
import { filesAPI } from "../services/api";
import { CloudFile, SortOption, ViewMode } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import { UploadModal } from "./UploadModal";
import { getErrorMessage } from "../utils/errorHandler";

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [currentPage, sortBy]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getFiles({
        page: currentPage,
        search: searchTerm,
        sortBy,
        limit: 12,
      });

      if (response.success && response.data) {
        setFiles(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.error || "Failed to fetch files");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFiles();
  };

  const handleFileUpload = async (file: globalThis.File, category: string) => {
    try {
      const response = await filesAPI.uploadFile(file, category);
      if (response.success) {
        setShowUploadModal(false);
        fetchFiles(); // Refresh the file list
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await filesAPI.deleteFile(fileId);
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleFileRestore = async (fileId: string) => {
    try {
      await filesAPI.restoreFile(fileId);
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Files</h2>
            <Button
              variant="primary"
              onClick={() => setShowUploadModal(true)}
              className="d-flex align-items-center"
            >
              <FiPlus className="me-2" />
              Upload File
            </Button>
          </div>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-secondary" type="submit">
                <FiSearch />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={6}>
          <div className="d-flex justify-content-end gap-2">
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{ width: "auto" }}
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="size">Size</option>
            </Form.Select>
            <Button
              variant="outline-secondary"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <FiList /> : <FiGrid />}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Files Grid/List */}
      {viewMode === "grid" ? (
        <Row>
          {files.map((file) => (
            <Col key={file.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <Card.Title className="mb-1 text-truncate">
                        {file.name}
                      </Card.Title>
                      <small className="text-muted">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </small>
                    </div>
                    <Dropdown>
                      <Dropdown.Toggle variant="link" size="sm" className="p-0">
                        <FiMoreVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>
                          <FiDownload className="me-2" />
                          Download
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <FiShare className="me-2" />
                          Share
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <FiEye className="me-2" />
                          Preview
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {file.isDeleted ? (
                          <Dropdown.Item
                            onClick={() => handleFileRestore(file.id)}
                          >
                            <FiRotateCcw className="me-2" />
                            Restore
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item
                            onClick={() => handleFileDelete(file.id)}
                            className="text-danger"
                          >
                            <FiTrash2 className="me-2" />
                            Delete
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <div className="mt-auto">
                    <Badge bg="secondary" className="me-1">
                      {file.category}
                    </Badge>
                    <small className="text-muted d-block">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Category</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.name}</td>
                  <td>{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                  <td>
                    <Badge bg="secondary">{file.category}</Badge>
                  </td>
                  <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="link" size="sm">
                        <FiMoreVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>
                          <FiDownload className="me-2" />
                          Download
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <FiShare className="me-2" />
                          Share
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <FiEye className="me-2" />
                          Preview
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {file.isDeleted ? (
                          <Dropdown.Item
                            onClick={() => handleFileRestore(file.id)}
                          >
                            <FiRotateCcw className="me-2" />
                            Restore
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item
                            onClick={() => handleFileDelete(file.id)}
                            className="text-danger"
                          >
                            <FiTrash2 className="me-2" />
                            Delete
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination>
              <Pagination.First
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                )
              )}
              <Pagination.Next
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Col>
        </Row>
      )}

      {/* Upload Modal */}
      <UploadModal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
      />
    </Container>
  );
};

export default FileManager;
