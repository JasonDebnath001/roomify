import { CheckCircle2, ImageIcon, UploadCloud } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
  MAX_UPLOAD_BYTES,
  ACCEPTED_FILE_TYPES,
} from "../lib/constants";

type UploadProps = {
  onComplete?: (base64: string) => void;
  onError?: (error: string) => void;
};

const Upload = ({ onComplete, onError }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const progressInterval = useRef<number | null>(null);
  const redirectTimeout = useRef<number | null>(null);

  const { isSignedIn } = useOutletContext<AuthContext>();

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
      if (redirectTimeout.current) {
        window.clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) {
      return;
    }

    // Validation
    if (selectedFile.size > MAX_UPLOAD_BYTES) {
      onError?.("File size exceeds the maximum allowed (50MB).");
      return;
    }
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      onError?.("Invalid file type. Only JPG, JPEG, and PNG are allowed.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = typeof reader.result === "string" ? reader.result : "";
      setFile(selectedFile);
      setProgress(0);

      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }

      progressInterval.current = window.setInterval(() => {
        setProgress((currentProgress) => {
          const nextProgress = Math.min(currentProgress + PROGRESS_STEP, 100);

          if (nextProgress >= 100 && progressInterval.current) {
            window.clearInterval(progressInterval.current);
            progressInterval.current = null;
            redirectTimeout.current = window.setTimeout(() => {
              onComplete?.(base64);
            }, REDIRECT_DELAY_MS);
          }

          return nextProgress;
        });
      }, PROGRESS_INTERVAL_MS);
    };

    reader.onerror = () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      if (redirectTimeout.current) {
        window.clearTimeout(redirectTimeout.current);
        redirectTimeout.current = null;
      }
      setFile(null);
      setProgress(0);
      onError?.("Failed to read the file.");
    };

    reader.onabort = () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      if (redirectTimeout.current) {
        window.clearTimeout(redirectTimeout.current);
        redirectTimeout.current = null;
      }
      setFile(null);
      setProgress(0);
      onError?.("File reading was aborted.");
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) {
      return;
    }

    const files = event.target.files;
    if (files?.length) {
      processFile(files[0]);
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (!isSignedIn) {
      return;
    }

    const files = event.dataTransfer.files;
    if (files?.length) {
      processFile(files[0]);
    }
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={handleInputChange}
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadCloud size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or drag and drop"
                : "Sign in or Sign up to Puter to upload"}
            </p>
            <p className="help">Maximum file size 50mb</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>
            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />

              <p className="status-text">
                {progress < 100 ? "Analyzing floor plan..." : "Redirecting..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
