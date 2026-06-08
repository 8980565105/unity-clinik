import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

function ImageUpload({
  value = null,
  onChange,
  multiple = false,
  className = "",
  size = 128,
}) {
  const IMAGE_BASE_URL = process.env.REACT_APP_API_URL_IMAGE || "";
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("image", file);
    });

    try {
      setUploading(true);

      const res = await api.post(ROUTES.upload.image, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        let uploadedUrls = [];

        if (Array.isArray(res.data.data)) {
          uploadedUrls = res.data.data.map((img) => img.image_url);
        } else if (res.data.data?.image_url) {
          uploadedUrls = [res.data.data.image_url];
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
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    if (multiple && Array.isArray(value) && index !== undefined) {
      const newValues = [...value];

      newValues.splice(index, 1);

      onChange(newValues.length > 0 ? newValues : null);
    } else {
      onChange(null);
    }
  };

  if (multiple) {
    return (
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
              <img
                src={
                  typeof url === "string"
                    ? url.startsWith("http")
                      ? url
                      : `${IMAGE_BASE_URL}${url}`
                    : ""
                }
                alt="Uploaded"
                className="w-full h-full object-contain rounded"
              />

              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ))}

        <label
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer hover:border-gray-500 ${className}`}
          style={{
            width: size,
            height: size,
          }}
        >
          <Upload className="h-6 w-6 mb-1" />

          <span className="text-sm">
            {uploading ? "Uploading..." : "Upload Images"}
          </span>

          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    );
  }

  return value ? (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={
          typeof value === "string"
            ? value.startsWith("http")
              ? value
              : `${IMAGE_BASE_URL}${value}`
            : ""
        }
        alt="Uploaded"
        className="w-full h-full object-contain rounded"
      />

      <button
        type="button"
        onClick={() => removeImage()}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
      >
        <X size={12} />
      </button>
    </div>
  ) : (
    <label
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer hover:border-gray-500 ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <Upload className="h-6 w-6 mb-1" />

      <span className="text-sm">
        {uploading ? "Uploading..." : "Upload Image"}
      </span>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  );
}

export default ImageUpload;
