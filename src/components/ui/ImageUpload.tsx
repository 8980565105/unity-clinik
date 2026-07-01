// // // import React, { useState } from "react";
// // // import { Upload, X } from "lucide-react";
// // // import { Button } from "@/components/ui/button";
// // // import api from "@/services/api";
// // // import { ROUTES } from "@/services/routes";

// // // interface ImageUploadProps {
// // //   value?: string | string[] | null;
// // //   onChange: (url: string | string[] | null) => void;
// // //   multiple?: boolean;
// // //   className?: string;
// // //   size?: number; // square size in px
// // // }

// // // export const ImageUpload: React.FC<ImageUploadProps> = ({
// // //   value,
// // //   onChange,
// // //   multiple = false,
// // //   className,
// // //   size = 128,
// // // }) => {
// // //   const [uploading, setUploading] = useState(false);

// // //  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
// // //   const files = e.target.files;
// // //   if (!files || files.length === 0) return;

// // //   const formData = new FormData();
// // //   Array.from(files).forEach((file) => formData.append("image", file));

// // //   try {
// // //     setUploading(true);
// // //     const res = await api.post(ROUTES.upload.image, formData, {
// // //       headers: { "Content-Type": "multipart/form-data" },
// // //     });

// // //     if (res.data.success) {
// // //       let uploadedUrls: string[] = [];

// // //       if (Array.isArray(res.data.data)) {
// // //         uploadedUrls = res.data.data.map((img: any) => img.image_url);
// // //       } else if (res.data.data.image_url) {
// // //         uploadedUrls = [res.data.data.image_url];
// // //       }

// // //       if (multiple) {
// // //         const newValues = Array.isArray(value) ? [...value, ...uploadedUrls] : uploadedUrls;
// // //         onChange(newValues);
// // //       } else {
// // //         onChange(uploadedUrls[0] || null);
// // //       }
// // //     }
// // //   } catch (err) {
// // //     console.error("Image upload failed:", err);
// // //   } finally {
// // //     setUploading(false);
// // //   }
// // // };


// // //   const removeImage = (index?: number) => {
// // //     if (multiple && Array.isArray(value) && index !== undefined) {
// // //       const newValues = [...value];
// // //       newValues.splice(index, 1);
// // //       onChange(newValues.length > 0 ? newValues : null);
// // //     } else {
// // //       onChange(null);
// // //     }
// // //   };

// // //   if (multiple) {
// // //     return (
// // //       <div className="flex flex-wrap gap-2">
// // //         {Array.isArray(value) &&
// // //           value.map((url, idx) => (
// // //             <div key={idx} className="relative" style={{ width: size, height: size }}>
// // //               <img
// // //                 src={typeof url === "string" ? (url.startsWith("http") ? url : `${import.meta.env.VITE_API_URL_IMAGE}${url}`) : ""}
// // //                 alt="Uploaded"
// // //                 className="w-full h-full object-contain rounded"
// // //               />
// // //               <Button
// // //                 type="button"
// // //                 variant="destructive"
// // //                 size="icon"
// // //                 className="absolute -top-2 -right-2 h-6 w-6"
// // //                 onClick={() => removeImage(idx)}
// // //               >
// // //                 <X className="h-3 w-3" />
// // //               </Button>
// // //             </div>
// // //           ))}
// // //         <label
// // //           className={`flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer hover:border-muted-foreground/50 ${className}`}
// // //           style={{ width: size, height: size }}
// // //         >
// // //           <Upload className="h-6 w-6 text-muted-foreground mb-1" />
// // //           <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload Images"}</span>
// // //           <input type="file" accept="image/*" className="hidden" multiple onChange={handleFileChange} />
// // //         </label>
// // //       </div>
// // //     );
// // //   }

// // //   return value ? (
// // //     <div className="relative" style={{ width: size, height: size }}>
// // //       <img
// // //         src={typeof value === "string" ? (value.startsWith("http") ? value : `${import.meta.env.VITE_API_URL_IMAGE}${value}`) : ""}
// // //         alt="Uploaded"
// // //         className="w-full h-full object-contain rounded"
// // //       />
// // //       <Button
// // //         type="button"
// // //         variant="destructive"
// // //         size="icon"
// // //         className="absolute -top-2 -right-2 h-6 w-6"
// // //         onClick={() => removeImage()}
// // //       >
// // //         <X className="h-3 w-3" />
// // //       </Button>
// // //     </div>
// // //   ) : (
// // //     <label
// // //       className={`flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer hover:border-muted-foreground/50 ${className}`}
// // //       style={{ width: size, height: size }}
// // //     >
// // //       <Upload className="h-6 w-6 text-muted-foreground mb-1" />
// // //       <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload Image"}</span>
// // //       <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
// // //     </label>
// // //   );
// // // };



// // import React, { useState, useRef, useCallback } from "react";
// // import { Upload, X } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import api from "@/services/api";
// // import { ROUTES } from "@/services/routes";

// // interface ImageUploadProps {
// //   value?: string | string[] | null;
// //   onChange: (url: string | string[] | null) => void;
// //   multiple?: boolean;
// //   className?: string;
// //   size?: number;
// // }

// // export const ImageUpload: React.FC<ImageUploadProps> = ({
// //   value,
// //   onChange,
// //   multiple = false,
// //   className,
// //   size = 128,
// // }) => {
// //   const [uploading, setUploading] = useState(false);
// //   const [isDragging, setIsDragging] = useState(false);
// //   const inputRef = useRef<HTMLInputElement>(null);

// //   const uploadFiles = useCallback(async (files: File[]) => {
// //     if (!files.length) return;

// //     const formData = new FormData();
// //     files.forEach((file) => formData.append("image", file));

// //     try {
// //       setUploading(true);
// //       const res = await api.post(ROUTES.upload.image, formData, {
// //         headers: { "Content-Type": "multipart/form-data" },
// //       });

// //       if (res.data.success) {
// //         let uploadedUrls: string[] = [];

// //         if (Array.isArray(res.data.data)) {
// //           uploadedUrls = res.data.data.map((img: any) => img.image_url);
// //         } else if (res.data.data.image_url) {
// //           uploadedUrls = [res.data.data.image_url];
// //         }

// //         if (multiple) {
// //           const newValues = Array.isArray(value)
// //             ? [...value, ...uploadedUrls]
// //             : uploadedUrls;
// //           onChange(newValues);
// //         } else {
// //           onChange(uploadedUrls[0] || null);
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Image upload failed:", err);
// //     } finally {
// //       setUploading(false);
// //     }
// //   }, [value, multiple, onChange]);

// //   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const files = e.target.files;
// //     if (!files || files.length === 0) return;
// //     await uploadFiles(Array.from(files));
// //     if (inputRef.current) inputRef.current.value = "";
// //   };


// //   const handleDragEnter = (e: React.DragEvent) => {
// //     e.preventDefault();
// //     e.stopPropagation();
// //     setIsDragging(true);
// //   };

// //   const handleDragOver = (e: React.DragEvent) => {
// //     e.preventDefault();
// //     e.stopPropagation();
// //     e.dataTransfer.dropEffect = "copy";
// //     setIsDragging(true);
// //   };

// //   const handleDragLeave = (e: React.DragEvent) => {
// //     e.preventDefault();
// //     e.stopPropagation();
// //     setIsDragging(false);
// //   };

// //   const handleDrop = async (e: React.DragEvent) => {
// //     e.preventDefault();
// //     e.stopPropagation();
// //     setIsDragging(false);

// //     const files = Array.from(e.dataTransfer.files).filter((f) =>
// //       f.type.startsWith("image/")
// //     );
// //     if (!files.length) return;

// //     await uploadFiles(multiple ? files : [files[0]]);
// //   };

// //   const removeImage = (index?: number) => {
// //     if (multiple && Array.isArray(value) && index !== undefined) {
// //       const newValues = [...value];
// //       newValues.splice(index, 1);
// //       onChange(newValues.length > 0 ? newValues : null);
// //     } else {
// //       onChange(null);
// //     }
// //   };

// //   const resolveUrl = (url: string) =>
// //     url.startsWith("http") ? url : `${import.meta.env.VITE_API_URL_IMAGE}${url}`;

// //   const dropZoneClass = `
// //     flex flex-col items-center justify-center border-2 border-dashed rounded 
// //     cursor-pointer transition-colors
// //     ${isDragging
// //       ? "border-blue-500 bg-blue-50 scale-[1.02]"
// //       : "border-gray-300 hover:border-muted-foreground/50"
// //     }
// //     ${className ?? ""}
// //   `.trim();


// //   if (multiple) {
// //     return (
// //       <div className="flex flex-wrap gap-2">
// //         {Array.isArray(value) &&
// //           value.map((url, idx) => (
// //             <div
// //               key={idx}
// //               className="relative"
// //               style={{ width: size, height: size }}
// //             >
// //               <img
// //                 src={typeof url === "string" ? resolveUrl(url) : ""}
// //                 alt="Uploaded"
// //                 className="w-full h-full object-contain rounded"
// //               />
// //               <Button
// //                 type="button"
// //                 variant="destructive"
// //                 size="icon"
// //                 className="absolute -top-2 -right-2 h-6 w-6"
// //                 onClick={() => removeImage(idx)}
// //               >
// //                 <X className="h-3 w-3" />
// //               </Button>
// //             </div>
// //           ))}

// //         <label
// //           className={dropZoneClass}
// //           style={{ width: size, height: size }}
// //           onDragEnter={handleDragEnter}
// //           onDragOver={handleDragOver}
// //           onDragLeave={handleDragLeave}
// //           onDrop={handleDrop}
// //         >
// //           <Upload className="h-6 w-6 text-muted-foreground mb-1" />
// //           <span className="text-xs text-center text-muted-foreground px-1 leading-tight">
// //             {uploading
// //               ? "Uploading..."
// //               : isDragging
// //                 ? "Drop here"
// //                 : "Upload / Drop"}
// //           </span>
// //           <input
// //             ref={inputRef}
// //             type="file"
// //             accept="image/*"
// //             className="hidden"
// //             multiple
// //             onChange={handleFileChange}
// //           />
// //         </label>
// //       </div>
// //     );
// //   }


// //   if (value) {
// //     return (
// //       <div className="relative" style={{ width: size, height: size }}>
// //         <img
// //           src={
// //             typeof value === "string" ? resolveUrl(value) : ""
// //           }
// //           alt="Uploaded"
// //           className="w-full h-full object-contain rounded"
// //         />
// //         <Button
// //           type="button"
// //           variant="destructive"
// //           size="icon"
// //           className="absolute -top-2 -right-2 h-6 w-6"
// //           onClick={() => removeImage()}
// //         >
// //           <X className="h-3 w-3" />
// //         </Button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <label
// //       className={dropZoneClass}
// //       style={{ width: size, height: size }}
// //       onDragEnter={handleDragEnter}
// //       onDragOver={handleDragOver}
// //       onDragLeave={handleDragLeave}
// //       onDrop={handleDrop}
// //     >
// //       <Upload className="h-6 w-6 text-muted-foreground mb-1" />
// //       <span className="text-xs text-center text-muted-foreground px-1 leading-tight">
// //         {uploading
// //           ? "Uploading..."
// //           : isDragging
// //             ? "Drop here!"
// //             : "Upload / Drop Image"}
// //       </span>
// //       <input
// //         ref={inputRef}
// //         type="file"
// //         accept="image/*"
// //         className="hidden"
// //         onChange={handleFileChange}
// //       />
// //     </label>
// //   );
// // };


// // components/ImageUpload.tsx

// import React, { useState, useRef, useCallback } from "react";
// import { Upload, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import api from "@/services/api";
// import { ROUTES } from "@/services/routes";

// interface UploadedImage {
//   url: string;
//   public_id: string;
// }

// interface ImageUploadProps {
//   value?: string | string[] | null;
//   onChange: (url: string | string[] | null) => void;

//   publicIds?: string | string[] | null;
//   onPublicIdsChange?: (ids: string | string[] | null) => void;

//   multiple?: boolean;
//   className?: string;
//   size?: number;
// }

// export const ImageUpload: React.FC<ImageUploadProps> = ({
//   value,
//   onChange,
//   publicIds,
//   onPublicIdsChange,
//   multiple = false,
//   className,
//   size = 128,
// }) => {
//   const [uploading, setUploading] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const uploadFiles = useCallback(
//     async (files: File[]) => {
//       if (!files.length) return;

//       const formData = new FormData();
//       files.forEach((file) => formData.append("image", file));

//       try {
//         setUploading(true);
//         const res = await api.post(ROUTES.upload.image, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });

//         if (res.data.success) {
//           const uploaded: UploadedImage[] = Array.isArray(res.data.data)
//             ? res.data.data.map((img: any) => ({
//               url: img.image_url || img.url,
//               public_id: img.public_id,
//             }))
//             : [
//               {
//                 url: res.data.data.image_url || res.data.data.url,
//                 public_id: res.data.data.public_id,
//               },
//             ];

//           if (multiple) {
//             const existingUrls = Array.isArray(value) ? value : value ? [value] : [];
//             const existingIds = Array.isArray(publicIds) ? publicIds : publicIds ? [publicIds] : [];

//             onChange([...existingUrls, ...uploaded.map((u) => u.url)]);
//             onPublicIdsChange?.([...existingIds, ...uploaded.map((u) => u.public_id)]);
//           } else {
//             onChange(uploaded[0]?.url || null);
//             onPublicIdsChange?.(uploaded[0]?.public_id || null);
//           }
//         }
//       } catch (err) {
//         console.error("Image upload failed:", err);
//       } finally {
//         setUploading(false);
//       }
//     },
//     [value, publicIds, multiple, onChange, onPublicIdsChange]
//   );

//   const deleteFromCloudinary = useCallback(async (public_id: string) => {
//     try {
//       await api.delete(ROUTES.upload.delete, {
//         data: { public_id, resource_type: "image" },
//       });
//     } catch (err) {
//       console.error("Cloudinary delete failed:", err);
//     }
//   }, []);

//   const removeImage = useCallback(
//     async (index?: number) => {
//       if (multiple && Array.isArray(value)) {
//         const newUrls = [...value];
//         const newIds = Array.isArray(publicIds) ? [...publicIds] : [];

//         const removedId = newIds[index ?? 0];
//         if (removedId) await deleteFromCloudinary(removedId);

//         if (index !== undefined) {
//           newUrls.splice(index, 1);
//           newIds.splice(index, 1);
//         }

//         onChange(newUrls.length > 0 ? newUrls : null);
//         onPublicIdsChange?.(newIds.length > 0 ? newIds : null);
//       } else {
//         const pid = typeof publicIds === "string" ? publicIds : null;
//         if (pid) await deleteFromCloudinary(pid);

//         onChange(null);
//         onPublicIdsChange?.(null);
//       }
//     },
//     [value, publicIds, multiple, onChange, onPublicIdsChange, deleteFromCloudinary]
//   );

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;
//     await uploadFiles(Array.from(files));
//     if (inputRef.current) inputRef.current.value = "";
//   };

//   const handleDragEnter = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(true);
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     e.dataTransfer.dropEffect = "copy";
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//   };

//   const handleDrop = async (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//     const files = Array.from(e.dataTransfer.files).filter((f) =>
//       f.type.startsWith("image/")
//     );
//     if (!files.length) return;
//     await uploadFiles(multiple ? files : [files[0]]);
//   };

//   const resolveUrl = (url: string) =>
//     url.startsWith("http")
//       ? url
//       : `${import.meta.env.VITE_API_URL_IMAGE}${url}`;

//   const dropZoneClass = `
//     flex flex-col items-center justify-center border-2 border-dashed rounded
//     cursor-pointer transition-colors
//     ${isDragging
//       ? "border-blue-500 bg-blue-50 scale-[1.02]"
//       : "border-gray-300 hover:border-muted-foreground/50"
//     }
//     ${className ?? ""}
//   `.trim();

//   if (multiple) {
//     return (
//       <div className="flex flex-wrap gap-2">
//         {Array.isArray(value) &&
//           value.map((url, idx) => (
//             <div
//               key={idx}
//               className="relative"
//               style={{ width: size, height: size }}
//             >
//               <img
//                 src={typeof url === "string" ? resolveUrl(url) : ""}
//                 alt="Uploaded"
//                 className="w-full h-full object-contain rounded"
//               />
//               <Button
//                 type="button"
//                 variant="destructive"
//                 size="icon"
//                 className="absolute -top-2 -right-2 h-6 w-6"
//                 onClick={() => removeImage(idx)}
//               >
//                 <X className="h-3 w-3" />
//               </Button>
//             </div>
//           ))}

//         <label
//           className={dropZoneClass}
//           style={{ width: size, height: size }}
//           onDragEnter={handleDragEnter}
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDrop}
//         >
//           <Upload className="h-6 w-6 text-muted-foreground mb-1" />
//           <span className="text-xs text-center text-muted-foreground px-1 leading-tight">
//             {uploading ? "Uploading..." : isDragging ? "Drop here!" : "Upload / Drop"}
//           </span>
//           <input
//             ref={inputRef}
//             type="file"
//             accept="image/*"
//             className="hidden"
//             multiple
//             onChange={handleFileChange}
//           />
//         </label>
//       </div>
//     );
//   }

//   if (value) {
//     return (
//       <div className="relative" style={{ width: size, height: size }}>
//         <img
//           src={typeof value === "string" ? resolveUrl(value) : ""}
//           alt="Uploaded"
//           className="w-full h-full object-contain rounded"
//         />
//         <Button
//           type="button"
//           variant="destructive"
//           size="icon"
//           className="absolute -top-2 -right-2 h-6 w-6"
//           onClick={() => removeImage()}
//         >
//           <X className="h-3 w-3" />
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <label
//       className={dropZoneClass}
//       style={{ width: size, height: size }}
//       onDragEnter={handleDragEnter}
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onDrop={handleDrop}
//     >
//       <Upload className="h-6 w-6 text-muted-foreground mb-1" />
//       <span className="text-xs text-center text-muted-foreground px-1 leading-tight">
//         {uploading ? "Uploading..." : isDragging ? "Drop here!" : "Upload / Drop Image"}
//       </span>
//       <input
//         ref={inputRef}
//         type="file"
//         accept="image/*"
//         className="hidden"
//         onChange={handleFileChange}
//       />
//     </label>
//   );
// };



// components/ImageUpload.tsx

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Link2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

interface UploadedImage {
  url: string;
  public_id: string;
}

interface ImageUploadProps {
  value?: string | string[] | null;
  onChange: (url: string | string[] | null) => void;

  publicIds?: string | string[] | null;
  onPublicIdsChange?: (ids: string | string[] | null) => void;

  multiple?: boolean;
  className?: string;
  size?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  publicIds,
  onPublicIdsChange,
  multiple = false,
  className,
  size = 150,
}) => {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<"file" | "link">("file");
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pushUploaded = useCallback(
    (uploaded: UploadedImage[]) => {
      if (multiple) {
        const existingUrls = Array.isArray(value) ? value : value ? [value] : [];
        const existingIds = Array.isArray(publicIds) ? publicIds : publicIds ? [publicIds] : [];

        onChange([...existingUrls, ...uploaded.map((u) => u.url)]);
        onPublicIdsChange?.([...existingIds, ...uploaded.map((u) => u.public_id)]);
      } else {
        onChange(uploaded[0]?.url || null);
        onPublicIdsChange?.(uploaded[0]?.public_id || null);
      }
    },
    [value, publicIds, multiple, onChange, onPublicIdsChange]
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      const formData = new FormData();
      files.forEach((file) => formData.append("image", file));

      try {
        setUploading(true);
        const res = await api.post(ROUTES.upload.image, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.success) {
          const uploaded: UploadedImage[] = Array.isArray(res.data.data)
            ? res.data.data.map((img: any) => ({
              url: img.image_url || img.url,
              public_id: img.public_id,
            }))
            : [
              {
                url: res.data.data.image_url || res.data.data.url,
                public_id: res.data.data.public_id,
              },
            ];

          pushUploaded(uploaded);
        }
      } catch (err) {
        console.error("Image upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [pushUploaded]
  );

  const uploadFromUrl = useCallback(async () => {
    const trimmed = linkValue.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
    } catch {
      setLinkError("Please enter a valid URL");
      return;
    }

    setLinkError("");
    try {
      setUploading(true);
      const res = await api.post(ROUTES.upload.imageFromUrl, { url: trimmed });

      if (res.data.success) {
        const d = res.data.data;
        pushUploaded([{ url: d.image_url || d.url, public_id: d.public_id }]);
        setLinkValue("");
      } else {
        setLinkError(res.data.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Image upload from URL failed:", err);
      setLinkError(
        err?.response?.data?.message || "Could not upload image from this URL"
      );
    } finally {
      setUploading(false);
    }
  }, [linkValue, pushUploaded]);

  const deleteFromCloudinary = useCallback(async (public_id: string) => {
    try {
      await api.delete(ROUTES.upload.delete, {
        data: { public_id, resource_type: "image" },
      });
    } catch (err) {
      console.error("Cloudinary delete failed:", err);
    }
  }, []);

  const removeImage = useCallback(
    async (index?: number) => {
      if (multiple && Array.isArray(value)) {
        const newUrls = [...value];
        const newIds = Array.isArray(publicIds) ? [...publicIds] : [];

        const removedId = newIds[index ?? 0];
        if (removedId) await deleteFromCloudinary(removedId);

        if (index !== undefined) {
          newUrls.splice(index, 1);
          newIds.splice(index, 1);
        }

        onChange(newUrls.length > 0 ? newUrls : null);
        onPublicIdsChange?.(newIds.length > 0 ? newIds : null);
      } else {
        const pid = typeof publicIds === "string" ? publicIds : null;
        if (pid) await deleteFromCloudinary(pid);

        onChange(null);
        onPublicIdsChange?.(null);
      }
    },
    [value, publicIds, multiple, onChange, onPublicIdsChange, deleteFromCloudinary]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const textUrl = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );

    if (files.length) {
      await uploadFiles(multiple ? files : [files[0]]);
    } else if (textUrl && /^https?:\/\//i.test(textUrl)) {
      setLinkValue(textUrl);
      setMode("link");
    }
  };

  const resolveUrl = (url: string) =>
    url.startsWith("http")
      ? url
      : `${import.meta.env.VITE_API_URL_IMAGE}${url}`;

  const dropZoneClass = `
    flex flex-col items-center justify-center border-2 border-dashed rounded
    cursor-pointer transition-colors
    ${isDragging
      ? "border-blue-500 bg-blue-50 scale-[1.02]"
      : "border-gray-300 hover:border-muted-foreground/50"
    }
    ${className ?? ""}
  `.trim();

  // ---------- small tab switcher (file / link) ----------
  const ModeTabs = () => (
    <div className="flex gap-1 mb-1.5">
      <button
        type="button"
        onClick={() => setMode("file")}
        className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${mode === "file"
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-500 border-gray-200"
          }`}
      >
        <ImagePlus className="h-3 w-3" /> File
      </button>
      <button
        type="button"
        onClick={() => setMode("link")}
        className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${mode === "link"
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-500 border-gray-200"
          }`}
      >
        <Link2 className="h-3 w-3" /> Link
      </button>
    </div>
  );

  const LinkUploadBox = () => (
    <div
      className="flex flex-col items-center justify-center border-2 border-dashed rounded gap-2 p-2"
      style={{ width: size, height: size }}
    >
      <Link2 className="h-5 w-5 text-muted-foreground" />
      <Input
        placeholder="https://image-url.com/img.jpg"
        value={linkValue}
        onChange={(e) => {
          setLinkValue(e.target.value);
          setLinkError("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            uploadFromUrl();
          }
        }}
        className="h-7 text-xs"
      />
      <Button
        type="button"
        size="sm"
        className="h-6 text-xs w-full"
        disabled={uploading || !linkValue.trim()}
        onClick={uploadFromUrl}
      >
        {uploading ? "Uploading..." : "Upload link"}
      </Button>
      {linkError && (
        <p className="text-[10px] text-red-500 text-center leading-tight">{linkError}</p>
      )}
    </div>
  );

  if (multiple) {
    return (
      <div>
        <ModeTabs />
        <div className="flex flex-wrap gap-2">
          {Array.isArray(value) &&
            value.map((url, idx) => (
              <div key={idx} className="relative" style={{ width: size, height: size }}>
                <img
                  src={typeof url === "string" ? resolveUrl(url) : ""}
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

          {mode === "file" ? (
            <label
              className={dropZoneClass}
              style={{ width: size, height: size }}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-center text-muted-foreground px-1 leading-tight">
                {uploading ? "Uploading..." : isDragging ? "Drop here!" : "Upload / Drop"}
              </span>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <LinkUploadBox />
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ModeTabs />
      {value ? (
        <div className="relative" style={{ width: size, height: size }}>
          <img
            src={typeof value === "string" ? resolveUrl(value) : ""}
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
      ) : mode === "file" ? (
        <label
          className={dropZoneClass}
          style={{ width: size, height: size }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-xs text-center text-muted-foreground px-1 leading-tight">
            {uploading ? "Uploading..." : isDragging ? "Drop here!" : "Upload / Drop Image"}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <LinkUploadBox />
      )}
    </div>
  );
};