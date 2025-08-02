import React from "react";
import { Spinner } from "react-bootstrap";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case "sm":
        return "sm";
      case "lg":
        return undefined;
      default:
        return undefined;
    }
  };

  return (
    <div
      className={`d-flex justify-content-center align-items-center ${className}`}
    >
      <Spinner
        animation="border"
        role="status"
        size={getSpinnerSize()}
        variant="primary"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default LoadingSpinner;
