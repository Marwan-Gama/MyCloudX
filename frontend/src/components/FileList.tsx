import React from "react";
import { Table, Button, Dropdown } from "react-bootstrap";
import {
  FiMoreVertical,
  FiDownload,
  FiTrash2,
  FiRotateCcw,
  FiShare2,
} from "react-icons/fi";
import { CloudFile } from "../types";
import { filesAPI } from "../services/api";

interface FileListProps {
  files: CloudFile[];
  onDelete: (fileId: string) => void;
  onRestore: (fileId: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onDelete, onRestore }) => {
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

  const handleDownload = async (file: CloudFile) => {
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

  const handleShare = async (file: CloudFile) => {
    // TODO: Implement share functionality
    console.log("Share file:", file);
  };

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>Modified</th>
          <th>Owner</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <tr key={file.id}>
            <td>
              <div className="d-flex align-items-center">
                <span className="me-2">{getFileIcon(file.mimeType)}</span>
                <span className="text-truncate" title={file.name}>
                  {file.name}
                </span>
              </div>
            </td>
            <td>{formatFileSize(file.size)}</td>
            <td>{new Date(file.updatedAt).toLocaleDateString()}</td>
            <td>{file.owner.name}</td>
            <td>
              <div className="d-flex gap-1">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleDownload(file)}
                >
                  <FiDownload size={14} />
                </Button>

                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <FiMoreVertical size={14} />
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
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default FileList;
