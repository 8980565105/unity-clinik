import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

interface ImageUploadProps {
  value?: string | string[] | null;
  onChange: (url: string | string[] | null) => void;
  multiple?: boolean;
  className?: string;
  size?: number; // square size in px
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  className,
  size = 128,
}) => {
  const [uploading, setUploading] = useState(false);

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("image", file));

  try {
    setUploading(true);
    const res = await api.post(ROUTES.upload.image, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.success) {
      let uploadedUrls: string[] = [];

      if (Array.isArray(res.data.data)) {
        // multiple upload
        uploadedUrls = res.data.data.map((img: any) => img.image_url);
      } else if (res.data.data.image_url) {
        // single upload
        uploadedUrls = [res.data.data.image_url];
      }

      if (multiple) {
        const newValues = Array.isArray(value) ? [...value, ...uploadedUrls] : uploadedUrls;
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


  const removeImage = (index?: number) => {
    if (multiple && Array.isArray(value) && index !== undefined) {
      const newValues = [...value];
      newValues.splice(index, 1);
      onChange(newValues.length > 0 ? newValues : null);
    } else {
      onChange(null);
    }
  };

  // Render multiple images
  if (multiple) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.isArray(value) &&
          value.map((url, idx) => (
            <div key={idx} className="relative" style={{ width: size, height: size }}>
              <img
                src={typeof url === "string" ? (url.startsWith("http") ? url : `${import.meta.env.VITE_API_URL_IMAGE}${url}`) : ""}
                alt="Uploaded"
                className="w-full h-full object-contain rounded"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => removeImage(idx)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        <label
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer hover:border-muted-foreground/50 ${className}`}
          style={{ width: size, height: size }}
        >
          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload Images"}</span>
          <input type="file" accept="image/*" className="hidden" multiple onChange={handleFileChange} />
        </label>
      </div>
    );
  }

  // Render single image
  return value ? (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src={typeof value === "string" ? (value.startsWith("http") ? value : `${import.meta.env.VITE_API_URL_IMAGE}${value}`) : ""}
        alt="Uploaded"
        className="w-full h-full object-contain rounded"
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6"
        onClick={() => removeImage()}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  ) : (
    <label
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer hover:border-muted-foreground/50 ${className}`}
      style={{ width: size, height: size }}
    >
      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
      <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload Image"}</span>
      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </label>
  );
};
