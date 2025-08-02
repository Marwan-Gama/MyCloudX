import React, { useState, useRef } from "react";
import { Modal, Button, Form, Alert, ProgressBar } from "react-bootstrap";
import { FiUpload, FiX } from "react-icons/fi";
import { getErrorMessage } from "../utils/errorHandler";

interface UploadModalProps {
  show: boolean;
  onHide: () => void;
  onUpload: (file: globalThis.File, category: string) => Promise<void>;
}

const UploadModal: React.FC<UploadModalProps> = ({
  show,
  onHide,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(
    null
  );
  const [category, setCategory] = useState("My Files");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      await onUpload(selectedFile, category);

      setProgress(100);
      clearInterval(progressInterval);

      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setCategory("My Files");
        setProgress(0);
        setUploading(false);
        onHide();
      }, 1000);
    } catch (error) {
      setError(getErrorMessage(error));
      setUploading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setCategory("My Files");
      setProgress(0);
      setError(null);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton={!uploading}>
        <Modal.Title>Upload File</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select File</Form.Label>
            <div className="border rounded p-3 text-center">
              {selectedFile ? (
                <div>
                  <p className="mb-2">
                    <strong>{selectedFile.name}</strong>
                  </p>
                  <p className="text-muted mb-2">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploading}
                  >
                    <FiX className="me-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <FiUpload size={48} className="text-muted mb-3" />
                  <p className="text-muted mb-2">
                    Drag and drop a file here, or click to browse
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Choose File
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                disabled={uploading}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
            >
              <option value="My Files">My Files</option>
              <option value="Documents">Documents</option>
              <option value="Images">Images</option>
              <option value="Videos">Videos</option>
              <option value="Music">Music</option>
            </Form.Select>
          </Form.Group>

          {uploading && (
            <div className="mb-3">
              <Form.Label>Upload Progress</Form.Label>
              <ProgressBar now={progress} label={`${progress}%`} />
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export { UploadModal };
