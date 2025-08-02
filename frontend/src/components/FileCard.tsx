import React from "react";
import { Row, Col, Card, Button, Dropdown } from "react-bootstrap";
import {
  FiMoreVertical,
  FiDownload,
  FiTrash2,
  FiRotateCcw,
  FiShare2,
} from "react-icons/fi";
import { File } from "../types";
import { filesAPI } from "../services/api";

interface FileCardProps {
  files: File[];
  onDelete: (fileId: string) => void;
  onRestore: (fileId: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({ files, onDelete, onRestore }) => {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType.includes("document")) return "📝";
    if (mimeType.includes("spreadsheet")) return "📊";
    return "📁";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async (file: File) => {
    try {
      const response = await filesAPI.downloadFile(file.id);
      if (response.success && response.data) {
        const link = document.createElement("a");
        link.href = response.data.downloadUrl;
        link.download = response.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleShare = async (file: File) => {
    // TODO: Implement share functionality
    console.log("Share file:", file);
  };

  return (
    <Row>
      {files.map((file) => (
        <Col key={file.id} xs={12} sm={6} md={4} lg={3} xl={2} className="mb-3">
          <Card className="h-100 file-card">
            <Card.Body className="d-flex flex-column">
              <div className="text-center mb-3">
                <div className="file-icon mb-2">
                  {getFileIcon(file.mimeType)}
                </div>
                <h6 className="card-title text-truncate" title={file.name}>
                  {file.name}
                </h6>
              </div>

              <div className="mt-auto">
                <small className="text-muted d-block">
                  {formatFileSize(file.size)}
                </small>
                <small className="text-muted d-block">
                  {new Date(file.createdAt).toLocaleDateString()}
                </small>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    <FiDownload size={14} />
                  </Button>

                  <Dropdown>
                    <Dropdown.Toggle variant="link" size="sm" className="p-0">
                      <FiMoreVertical size={16} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleShare(file)}>
                        <FiShare2 size={14} className="me-2" />
                        Share
                      </Dropdown.Item>
                      {file.isDeleted ? (
                        <Dropdown.Item onClick={() => onRestore(file.id)}>
                          <FiRotateCcw size={14} className="me-2" />
                          Restore
                        </Dropdown.Item>
                      ) : (
                        <Dropdown.Item onClick={() => onDelete(file.id)}>
                          <FiTrash2 size={14} className="me-2" />
                          Delete
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default FileCard;
