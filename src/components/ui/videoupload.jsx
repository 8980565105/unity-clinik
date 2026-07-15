import React, { useState, useRef } from "react";
import { Upload, X, Film } from "lucide-react";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function VideoUpload({
  value = null,
  onChange,
  multiple = false,
  className = "",
  size = 160,
}) {
  const VIDEO_BASE_URL = process.env.REACT_APP_API_URL_IMAGE || "";
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const dragCounter = useRef(0);

  const clearErrorLater = () => {
    setTimeout(() => setError(""), 4000);
  };

  const validateFiles = (files) => {
    const valid = [];
    let hasError = false;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("video/")) {
        hasError = true;
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        hasError = true;
        return;
      }
      valid.push(file);
    });

    if (hasError) {
      setError(`Only video files under ${MAX_SIZE_MB}MB are allowed.`);
      clearErrorLater();
    }

    return valid;
  };

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    const validFiles = validateFiles(files);
    if (validFiles.length === 0) return;

    const formData = new FormData();

    validFiles.forEach((file) => {
      formData.append("video", file);
    });

    try {
      setUploading(true);

      const res = await api.post(ROUTES.upload.video, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        let uploadedUrls = [];

        if (Array.isArray(res.data.data)) {
          uploadedUrls = res.data.data.map((vid) => vid.video_url);
        } else if (res.data.data?.video_url) {
          uploadedUrls = [res.data.data.video_url];
        }

        if (multiple) {
          const newValues = Array.isArray(value)
            ? [...value, ...uploadedUrls]
            : uploadedUrls;

          onChange(newValues);
        } else {
          onChange(uploadedUrls[0] || null);
        }
      }
    } catch (err) {
      console.error("Video upload failed:", err);
      setError("Video upload failed. Please try again.");
      clearErrorLater();
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    await uploadFiles(e.target.files);
    // allow re-selecting same file again
    e.target.value = "";
  };

  const filterVideoFiles = (fileList) => {
    return Array.from(fileList).filter((file) =>
      file.type.startsWith("video/"),
    );
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (uploading) return;

    const files = e.dataTransfer.files;
    const videoFiles = filterVideoFiles(files);

    if (videoFiles.length === 0) {
      setError("Only video files are allowed.");
      clearErrorLater();
      return;
    }

    const filesToUpload = multiple ? videoFiles : [videoFiles[0]];

    const dt = new DataTransfer();
    filesToUpload.forEach((file) => dt.items.add(file));
    await uploadFiles(dt.files);
  };

  const removeVideo = (index) => {
    if (multiple && Array.isArray(value) && index !== undefined) {
      const newValues = [...value];

      newValues.splice(index, 1);

      onChange(newValues.length > 0 ? newValues : null);
    } else {
      onChange(null);
    }
  };

  const resolveUrl = (url) =>
    typeof url === "string"
      ? url.startsWith("http")
        ? url
        : `${VIDEO_BASE_URL}${url}`
      : "";

  const dropZoneBaseClass =
    "flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer transition-colors";
  const dropZoneStateClass = isDragging
    ? "border-blue-500 bg-blue-50"
    : "hover:border-gray-500";

  const renderDropZone = (label, dragLabel) => (
    <label
      className={`${dropZoneBaseClass} ${dropZoneStateClass} ${className}`}
      style={{
        width: size,
        height: size,
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {uploading ? (
        <span className="text-sm text-center px-1">Uploading...</span>
      ) : (
        <>
          <Film className="h-6 w-6 mb-1" />
          <Upload className="h-4 w-4 mb-1" />
          <span className="text-sm text-center px-1">
            {isDragging ? dragLabel : label}
          </span>
          <span className="text-xs text-gray-400 text-center px-1">
            Max {MAX_SIZE_MB}MB
          </span>
        </>
      )}

      <input
        type="file"
        accept="video/*"
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  );

  if (multiple) {
    return (
      <div>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(value) &&
            value.map((url, idx) => (
              <div
                key={idx}
                className="relative"
                style={{
                  width: size,
                  height: size,
                }}
              >
                <video
                  src={resolveUrl(url)}
                  controls
                  className="w-full h-full object-contain rounded bg-black"
                />

                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

          {renderDropZone("Upload Videos", "Drop videos here")}
        </div>

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      {value ? (
        <div
          className="relative"
          style={{
            width: size,
            height: size,
          }}
        >
          <video
            src={resolveUrl(value)}
            controls
            className="w-full h-full object-contain rounded bg-black"
          />

          <button
            type="button"
            onClick={() => removeVideo()}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        renderDropZone("Upload Video", "Drop video here")
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default VideoUpload;
