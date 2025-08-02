import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import { FiUpload, FiSearch, FiGrid, FiList, FiPlus } from "react-icons/fi";
import { filesAPI } from "../services/api";
import {
  File,
  FileCategory,
  ViewMode,
  SortOption,
  SortDirection,
} from "../types";
import FileCard from "./FileCard";
import FileList from "./FileList";
import UploadModal from "./UploadModal";
import LoadingSpinner from "./LoadingSpinner";

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFiles();
  }, [currentPage, sortBy, sortDirection]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await filesAPI.getFiles({
        page: currentPage,
        limit: 20,
        sortBy,
        sortDirection,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setFiles(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.error || "Failed to fetch files");
      }
    } catch (error) {
      setError(error.message || "Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFiles();
  };

  const handleFileUpload = async (file: File, category: string) => {
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
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <FiList /> : <FiGrid />}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Error Message */}
      {error && (
        <Row className="mb-4">
          <Col>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}

      {/* File List */}
      {files.length === 0 ? (
        <Row>
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <FiUpload size={48} className="text-muted mb-3" />
                <h5>No files found</h5>
                <p className="text-muted">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "Upload your first file to get started."}
                </p>
                {!searchTerm && (
                  <Button
                    variant="primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload File
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <>
          {viewMode === "grid" ? (
            <FileCard
              files={files}
              onDelete={handleFileDelete}
              onRestore={handleFileRestore}
            />
          ) : (
            <FileList
              files={files}
              onDelete={handleFileDelete}
              onRestore={handleFileRestore}
            />
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Row className="mt-4">
          <Col>
            <div className="d-flex justify-content-center">
              <div className="btn-group">
                <Button
                  variant="outline-primary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button variant="outline-primary" disabled>
                  Page {currentPage} of {totalPages}
                </Button>
                <Button
                  variant="outline-primary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
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
