import React, { useEffect, useRef, useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Copy, GripVertical, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBasePath } from "@/hooks/useBasePath";
import {
  createProduct,
  duplicateProduct,
  fetchProducts,
  getProductById,
  updateProduct,
} from "@/features/products/productsThunk";
import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
import { fetchBrands } from "@/features/brands/brandsThunk";
import { fetchTypes } from "@/features/types/typesThunk";
import { fetchProductLabels } from "@/features/productLabels/productLabelsThunk";
import { VideoUpload } from "../slider/sliderFrom";


const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const SECTION_TYPES = [
  "Multi Step Selection",
  "Root Cause Section",
  "How Does It Do It Section",
  "Benefits Section",
  "Treatment Kit Section",
  "Treatment Journey Section",
  "Ingredients Section",
  "use and Others points",
  "Image Banner Section",
  "Why Choose Unity Hair",
  "Before & After",
  "FAQ 1",
  "FAQ 2",
  "Solution By Stage Section",
  "Product Recommendation Section",
  "Product Attribute Section",
  "Additional Information Section",
  "Daily Usage Section",
  "Other Recommended Solutions",
  "How to use",
  "Result Section"
];

const buildSectionData = (type: string) => {
  switch (type) {
    case "Multi Step Selection":
      return { status: true, title: "Pack Selection", description: "", steps: [{ status: true, title: "Choose Pack", description: "", display_type: "Pack", variants: [] }] };
    case "Image Banner Section":
      return { status: true, title: "", description: "", items: [] };
    case "Why Choose Unity Hair":
      return { status: true, title: "", description: "", items: [{ title: "", description: "", image: "" }] };
    case "Before & After":
      return { status: true, title: "", description: "", items: [{ title: "", description: "", beforeImage: "", afterImage: "" }] };
    case "FAQ 1":
    case "FAQ 2":
      return { status: true, title: "", description: "", questions: [{ question: "", answer: "", image: "" }] };
    case "Root Cause Section":
    case "How Does It Do It Section":
    case "Benefits Section":
    case "Ingredients Section":
    case "Treatment Kit Section":
      return { status: true, title: "", description: "", items: [{ name: "", description: "", image: "" }] };
    case "Treatment Journey Section":
      return { status: true, title: "", description: "", image: "", items: [{ title: "", description: "", image: "" }] };
    case "use and Others points":
      return { status: true, title: "", description: "", items: [{ name: "", description: "" }] };
    case "Solution By Stage Section":
      return { status: true, title: "", description: "", items: [{ title: "", description: "", image: "", product_id: "", videoUploading: false }] };
    case "Product Recommendation Section":
      return { status: true, title: "", description: "", items: [{ title: "", description: "", product_id: "" }] };
    case "Product Attribute Section":
      return { status: true, title: "", description: "", items: [{ key: "", value: "" }] };
    case "Additional Information Section":
      return {
        status: true,
        title: "Additional Information",
        description: "",
        items: [
          {
            net_quantity: "",
            manufactured_by: "",
            marketed_by: "",
            country_origin: "",
            product_dimensions: "",
            best_before: "",
          },
        ],
      };


    case "Daily Usage Section":
      return {
        status: true,
        title: "",
        items: [
          {
            image: "",
            title: "",
            description: "",
          },
        ],
      };


    case "How to use":
      return {
        status: true,
        title: "",
        description: "",
        items: [
          {
            image: "",
            title: "",
            description: "",
          },
        ],
      };

    case "Other Recommended Solutions":
      return {
        status: true,
        title: "",
        description: "",
        items: [
          {
            title: "",
            description: "",
            product_id: "",
          },
        ],
      };


    case "Result Section":
      return {
        status: true,
        title: "",
        description: "",
        items: [
          {
            beforeImage: "",
            afterImage: "",
            reviewDescription: "",
            customerName: "",
            customerAge: "",
            verifiedReview: true,
            stageLabel: "",
          },
        ],
      };

    default:
      return { status: true, title: "", description: "", items: [] };
  }
};

export function DraggableImageList({ images, onChange, onAddMore, apiUrlImage = "" }: any) {
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const isDraggingImage = useRef(false);

  const handleDragStart = (e: any, idx: number) => {
    isDraggingImage.current = true;
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: any, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(idx);
  };

  const handleDrop = (e: any, dropIdx: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isDraggingImage.current) return;
    if (dragIdx.current === null || dragIdx.current === dropIdx) {
      setDragOver(null); return;
    }
    const updated = [...images];
    const [moved] = updated.splice(dragIdx.current, 1);
    updated.splice(dropIdx, 0, moved);
    onChange(updated);
    dragIdx.current = null;
    isDraggingImage.current = false;
    setDragOver(null);
  };

  const handleDragEnd = () => {
    isDraggingImage.current = false;
    dragIdx.current = null;
    setDragOver(null);
  };

  const removeImg = (idx: number) => {
    const u = [...images];
    u.splice(idx, 1);
    onChange(u);
  };

  const handleAddImages = (urls: any) => {
    let newUrls: string[] = [];
    if (Array.isArray(urls)) {
      newUrls = urls.filter(Boolean);
    } else if (typeof urls === "string" && urls) {
      newUrls = [urls];
    }
    if (newUrls.length > 0) {
      onAddMore(newUrls);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap gap-3"
        onDragOver={(e) => e.stopPropagation()}
        onDrop={(e) => e.stopPropagation()}
      >
        {images.map((img: string, idx: number) => {
          const src = img.startsWith("http") ? img : `${apiUrlImage}${img}`;
          return (
            <div
              key={idx}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragLeave={() => setDragOver(null)}
              onDragEnd={handleDragEnd} // ✅ Add this
              className={`relative group cursor-grab active:cursor-grabbing rounded-lg border-2 transition-all ${dragOver === idx ? "border-blue-500 scale-105" : "border-gray-200"
                }`}
              style={{ width: 110, height: 110 }}
            >
              <img
                src={src}
                alt={`img-${idx}`}
                className="w-full h-full object-cover rounded-lg select-none"
                draggable={false}
              />
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs rounded px-1">
                {idx + 1}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-lg transition-opacity">
                <GripVertical className="text-white w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => removeImg(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
              >
                ×
              </button>
            </div>
          );
        })}

        <div className="w-[110px] h-[110px]">
          <ImageUpload
            value={[]}
            onChange={handleAddImages}
            multiple
            size={110}
          />
        </div>
      </div>
    </div>
  );
}

// export function DraggableVideoList({ videos, onChange, apiUrlImage = "" }: any) {
//   const dragIdx = useRef<number | null>(null);
//   const [dragOver, setDragOver] = useState<number | null>(null);
//   const [uploading, setUploading] = useState(false);

//   const handleDragStart = (e: any, idx: number) => {
//     dragIdx.current = idx;
//     e.dataTransfer.effectAllowed = "move";
//   };

//   const handleDragOver = (e: any, idx: number) => {
//     e.preventDefault();
//     setDragOver(idx);
//   };

//   const handleDrop = (e: any, dropIdx: number) => {
//     e.preventDefault();
//     if (dragIdx.current === null || dragIdx.current === dropIdx) { setDragOver(null); return; }
//     const updated = [...videos];
//     const [moved] = updated.splice(dragIdx.current, 1);
//     updated.splice(dropIdx, 0, moved);
//     onChange(updated);
//     dragIdx.current = null;
//     setDragOver(null);
//   };

//   const removeVideo = (idx: number) => {
//     const u = [...videos];
//     u.splice(idx, 1);
//     onChange(u);
//   };

//   const addVideo = (url: string) => {
//     if (!url) return;
//     onChange([...(videos || []), url]);
//   };

//   return (
//     <div className="space-y-3">
//       <div className="flex flex-wrap gap-3">
//         {(videos || []).map((vid: string, idx: number) => {
//           const src = vid.startsWith("http") ? vid : `${apiUrlImage}${vid}`;
//           return (
//             <div
//               key={idx}
//               draggable
//               onDragStart={(e) => handleDragStart(e, idx)}
//               onDragOver={(e) => handleDragOver(e, idx)}
//               onDrop={(e) => handleDrop(e, idx)}
//               onDragLeave={() => setDragOver(null)}
//               onDragEnd={() => { dragIdx.current = null; setDragOver(null); }}
//               className={`relative group cursor-grab active:cursor-grabbing rounded-lg border-2 transition-all ${dragOver === idx ? "border-blue-500 scale-105" : "border-gray-200"}`}
//               style={{ width: 140, height: 110 }}
//             >
//               <video
//                 src={src}
//                 className="w-full h-full object-cover rounded-lg"
//                 muted
//               />
//               <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs rounded px-1">
//                 {idx + 1}
//               </div>
//               <button
//                 type="button"
//                 onClick={() => removeVideo(idx)}
//                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
//               >
//                 ×
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       <div style={{ width: 200 }}>
//         <VideoUpload
//           value={null}
//           uploading={uploading}
//           onChange={(url: string) => {
//             addVideo(url);
//           }}
//           onUploadingChange={(loading: boolean) => setUploading(loading)}
//         />
//       </div>
//     </div>
//   );
// }
export function DraggableVideoList({ videos, onChange, apiUrlImage = "", multiple = true }: any) {
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDragStart = (e: any, idx: number) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: any, idx: number) => {
    e.preventDefault();
    setDragOver(idx);
  };

  const handleDrop = (e: any, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === dropIdx) { setDragOver(null); return; }
    const updated = [...videos];
    const [moved] = updated.splice(dragIdx.current, 1);
    updated.splice(dropIdx, 0, moved);
    onChange(updated);
    dragIdx.current = null;
    setDragOver(null);
  };

  const removeVideo = (idx: number) => {
    const u = [...videos];
    u.splice(idx, 1);
    onChange(u);
  };

  const addVideo = (url: string) => {
    if (!url) return;
    if (!multiple) {
      // single mode: always replace with the new one
      onChange([url]);
      return;
    }
    onChange([...(videos || []), url]);
  };

  const reachedLimit = !multiple && (videos || []).length >= 1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {(videos || []).map((vid: string, idx: number) => {
          const src = vid.startsWith("http") ? vid : `${apiUrlImage}${vid}`;
          return (
            <div
              key={idx}
              draggable={multiple}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragLeave={() => setDragOver(null)}
              onDragEnd={() => { dragIdx.current = null; setDragOver(null); }}
              className={`relative group cursor-grab active:cursor-grabbing rounded-lg border-2 transition-all ${dragOver === idx ? "border-blue-500 scale-105" : "border-gray-200"}`}
              style={{ width: 140, height: 110 }}
            >
              <video
                src={src}
                className="w-full h-full object-cover rounded-lg"
                muted
              />
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs rounded px-1">
                {idx + 1}
              </div>
              <button
                type="button"
                onClick={() => removeVideo(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {!reachedLimit && (
        <div style={{ width: 200 }}>
          <VideoUpload
            value={null}
            uploading={uploading}
            onChange={(url: string) => {
              addVideo(url);
            }}
            onUploadingChange={(loading: boolean) => setUploading(loading)}
          />
        </div>
      )}
    </div>
  );
}

function useDragList(list: any[], setList: any) {
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const onDragStart = (idx: number) => { dragIdx.current = idx; };
  const onDragOver = (e: any, idx: number) => { e.preventDefault(); setDragOver(idx); };
  const onDrop = (e: any, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === dropIdx) { setDragOver(null); return; }
    const updated = [...list];
    const [moved] = updated.splice(dragIdx.current, 1);
    updated.splice(dropIdx, 0, moved);
    setList(updated);
    dragIdx.current = null;
    setDragOver(null);
  };
  const onDragLeave = () => setDragOver(null);
  const onDragEnd = () => { dragIdx.current = null; setDragOver(null); };

  return { dragOver, onDragStart, onDragOver, onDrop, onDragLeave, onDragEnd };
}

function DraggableItemList({ items, onReorder, renderItem, onRemove, onAdd, addLabel = "Add Item", itemLabel = "Item" }: any) {
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleDragStart = (e: any, idx: number) => { dragIdx.current = idx; e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: any, idx: number) => { e.preventDefault(); setDragOver(idx); };
  const handleDrop = (e: any, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === dropIdx) { setDragOver(null); return; }
    const updated = [...items];
    const [moved] = updated.splice(dragIdx.current, 1);
    updated.splice(dropIdx, 0, moved);
    onReorder(updated);
    dragIdx.current = null;
    setDragOver(null);
  };

  return (
    <div className="space-y-3">
      {items.map((item: any, itemIdx: number) => (
        <div
          key={itemIdx}
          draggable
          onDragStart={(e) => handleDragStart(e, itemIdx)}
          onDragOver={(e) => handleDragOver(e, itemIdx)}
          onDrop={(e) => handleDrop(e, itemIdx)}
          onDragLeave={() => setDragOver(null)}
          onDragEnd={() => { dragIdx.current = null; setDragOver(null); }}
          className={`p-3 border rounded-lg bg-white space-y-3 transition-all ${dragOver === itemIdx ? "border-blue-400 bg-blue-50 scale-[1.01]" : ""}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600" title="Drag to reorder">
                <GripVertical className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium text-gray-600">
                {item.name || item.title || item.question || `${itemLabel} ${itemIdx + 1}`}
              </span>
            </div>
            <Button type="button" variant="destructive" size="sm" onClick={() => onRemove(itemIdx)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          {renderItem(item, itemIdx)}
        </div>
      ))}
      <div className="flex justify-center pt-2">
        <Button type="button" onClick={onAdd}>{addLabel}</Button>
      </div>
    </div>
  );
}


function InsertBetweenSectionButton({ insertAfterIdx, onInsert }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center my-1 group">
      <div className="flex-1 h-px bg-gray-200 group-hover:bg-blue-200 transition-colors" />
      <Button type="button" onClick={() => setOpen(!open)} className="mx-2 flex items-center gap-1 text-xs rounded-full px-3 py-1 transition-all whitespace-nowrap">
        <Plus className="w-3 h-3" /> Insert between section
      </Button>
      <div className="flex-1 h-px bg-gray-200 group-hover:bg-blue-200 transition-colors" />
      {open && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto">
          {SECTION_TYPES.map((sType) => (
            <div key={sType} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => { onInsert(sType); setOpen(false); }}>
              {sType}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddFirstSectionButton({ onAdd }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex justify-center mt-4">
      {open && (
        <div className="absolute bottom-12 z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {SECTION_TYPES.map((sType) => (
            <div key={sType} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => { onAdd(sType); setOpen(false); }}>
              {sType}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function CommonHeader({
  sType,
  status,
  title,
  description,
  onStatusChange,
  onTitleChange,
  onDescriptionChange,
}: {
  sType: string;
  status: boolean;
  title: string;
  description: string;
  onStatusChange: (val: boolean) => void;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Label>{sType} Status</Label>
        <Switch checked={status !== false} onCheckedChange={onStatusChange} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Title</Label>
          <Input
            value={title || ""}
            placeholder="Enter Title"
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Input
            placeholder="Enter Description"
            value={description || ""}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}


const SectionRenderer = React.memo(function SectionRenderer({
  section,
  idx,
  setSections,
  products,
  id,
}: {
  section: any;
  idx: number;
  setSections: React.Dispatch<React.SetStateAction<any[]>>;
  products: any[];
  id: string | undefined;
}) {

  const updateSectionField = useCallback((field: string, value: any) => {
    setSections((prev) => {
      const u = [...prev];
      u[idx] = { ...u[idx], data: { ...u[idx].data, [field]: value } };
      return u;
    });
  }, [setSections, idx]);

  const updateSectionItems = useCallback((newItems: any[]) => {
    setSections((prev) => {
      const u = [...prev];
      u[idx] = { ...u[idx], data: { ...u[idx].data, items: newItems } };
      return u;
    });
  }, [setSections, idx]);

  const addSectionItem = useCallback((defaultItem: any) => {
    setSections((prev) => {
      const u = prev.map((s, i) => i === idx ? { ...s, data: { ...s.data, items: [...(s.data.items || []), defaultItem] } } : s);
      return u;
    });
  }, [setSections, idx]);

  const removeSectionItem = useCallback((itemIdx: number) => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        const newItems = [...s.data.items];
        newItems.splice(itemIdx, 1);
        return { ...s, data: { ...s.data, items: newItems } };
      });
      return u;
    });
  }, [setSections, idx]);

  const updateSectionItem = useCallback((itemIdx: number, field: string, value: any) => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        const newItems = s.data.items.map((item: any, ii: number) =>
          ii === itemIdx ? { ...item, [field]: value } : item
        );
        return { ...s, data: { ...s.data, items: newItems } };
      });
      return u;
    });
  }, [setSections, idx]);

  const updateFaqItems = useCallback((newItems: any[]) => {
    setSections((prev) => {
      const u = prev.map((s, i) => i === idx ? { ...s, data: { ...s.data, questions: newItems } } : s);
      return u;
    });
  }, [setSections, idx]);

  const addFaqQuestion = useCallback(() => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        return { ...s, data: { ...s.data, questions: [...(s.data.questions || []), { question: "", answer: "", image: "" }] } };
      });
      return u;
    });
  }, [setSections, idx]);

  const removeFaqQuestion = useCallback((qIdx: number) => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        const newQ = [...s.data.questions];
        newQ.splice(qIdx, 1);
        return { ...s, data: { ...s.data, questions: newQ } };
      });
      return u;
    });
  }, [setSections, idx]);

  const updateFaqQuestion = useCallback((qIdx: number, field: string, value: any) => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        const newQ = s.data.questions.map((q: any, qi: number) =>
          qi === qIdx ? { ...q, [field]: value } : q
        );
        return { ...s, data: { ...s.data, questions: newQ } };
      });
      return u;
    });
  }, [setSections, idx]);

  const addStep = useCallback(() => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        return { ...s, data: { ...s.data, steps: [...(s.data.steps || []), { status: true, title: "", description: "", display_type: "Text", variants: [] }] } };
      });
      return u;
    });
  }, [setSections, idx]);

  const removeStep = useCallback((stepIdx: number) => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        const newSteps = [...s.data.steps];
        newSteps.splice(stepIdx, 1);
        return { ...s, data: { ...s.data, steps: newSteps } };
      });
      return u;
    });
  }, [setSections, idx]);

  const updateStepField = useCallback((stepIdx: number, field: string, value: any) => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        const newSteps = s.data.steps.map((step: any, si: number) =>
          si === stepIdx ? { ...step, [field]: value } : step
        );
        return { ...s, data: { ...s.data, steps: newSteps } };
      });
      return u;
    });
  }, [setSections, idx]);

  const addVariantToStep = useCallback((stepIdx: number) => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        const newSteps = s.data.steps.map((step: any, si: number) => {
          if (si !== stepIdx) return step;
          const newVariant = step.display_type === "Pack"
            ? { image: "", price: "", offerprice: "", badge: "" }
            : { title: "", slug: "", description: "", image: "", product_id: null };
          return { ...step, variants: [...(step.variants || []), newVariant] };
        });
        return { ...s, data: { ...s.data, steps: newSteps } };
      });
      return u;
    });
  }, [setSections, idx]);

  const removeVariantFromStep = useCallback((stepIdx: number, variantIdx: number) => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        const newSteps = s.data.steps.map((step: any, si: number) => {
          if (si !== stepIdx) return step;
          const newVariants = [...step.variants];
          newVariants.splice(variantIdx, 1);
          return { ...step, variants: newVariants };
        });
        return { ...s, data: { ...s.data, steps: newSteps } };
      });
      return u;
    });
  }, [setSections, idx]);

  const updateVariantField = useCallback((stepIdx: number, variantIdx: number, field: string, value: any) => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        const newSteps = s.data.steps.map((step: any, si: number) => {
          if (si !== stepIdx) return step;
          const newVariants = step.variants.map((v: any, vi: number) => {
            if (vi !== variantIdx) return v;
            const updated = { ...v, [field]: value };
            if (step.display_type !== "Pack" && field === "title" && !v._slugManuallyEdited) {
              updated.slug = generateSlug(value);
            }
            return updated;
          });
          return { ...step, variants: newVariants };
        });
        return { ...s, data: { ...s.data, steps: newSteps } };
      });
      return u;
    });
  }, [setSections, idx]);

  const handleSlugManualEdit = useCallback((stepIdx: number, variantIdx: number, value: string) => {
    setSections((prev) => {
      const u = prev.map((s, i) => {
        if (i !== idx) return s;
        const newSteps = s.data.steps.map((step: any, si: number) => {
          if (si !== stepIdx) return step;
          const newVariants = step.variants.map((v: any, vi: number) => {
            if (vi !== variantIdx) return v;
            return { ...v, slug: value, _slugManuallyEdited: value !== generateSlug(v.title || "") };
          });
          return { ...step, variants: newVariants };
        });
        return { ...s, data: { ...s.data, steps: newSteps } };
      });
      return u;
    });
  }, [setSections, idx]);
  const sType = section.type;
  const data = section.data;
  if (sType === "Multi Step Selection") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <div className="space-y-6">
          {(data.steps || []).map((step: any, stepIdx: number) => (
            <div key={stepIdx} className="border rounded-xl p-4 bg-slate-50">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold text-lg">Step {stepIdx + 1}</h3>
                <div className="flex items-center gap-3">
                  <Label>Step Status</Label>
                  <Switch checked={step?.status !== false} onCheckedChange={(checked) => updateStepField(stepIdx, "status", checked)} />
                  <Button type="button" variant="destructive" onClick={() => removeStep(stepIdx)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Step Title</Label><Input value={step.title} placeholder="e.g. Select your scalp type" onChange={(e) => updateStepField(stepIdx, "title", e.target.value)} /></div>
                <div><Label>Description</Label><Input value={step.description} placeholder="description" onChange={(e) => updateStepField(stepIdx, "description", e.target.value)} /></div>
                <div>
                  <Label>Display Type</Label>
                  <Select value={step.display_type || "Text"} onValueChange={(value) => updateStepField(stepIdx, "display_type", value)}>
                    <SelectTrigger><SelectValue placeholder="Select display type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Text">Text</SelectItem>
                      <SelectItem value="Text with img">Text with img</SelectItem>
                      <SelectItem value="Upgrade Product">Upgrade Product</SelectItem>
                      <SelectItem value="Pack">Pack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4 mt-4">
                <DraggableItemList
                  items={step.variants || []}
                  onReorder={(newVariants: any[]) => updateStepField(stepIdx, "variants", newVariants)}
                  itemLabel="Variant"
                  addLabel="Add Option"
                  onAdd={() => addVariantToStep(stepIdx)}
                  onRemove={(variantIdx: number) => removeVariantFromStep(stepIdx, variantIdx)}
                  renderItem={(variant: any, variantIdx: number) => (
                    <div>
                      {step.display_type === "Pack" ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>Original Price</Label><Input type="number" value={variant.price || ""} placeholder="MRP" onChange={(e) => updateVariantField(stepIdx, variantIdx, "price", e.target.value)} /></div>
                          <div><Label>Offer Price</Label><Input type="number" value={variant.offerprice || ""} placeholder="Offer Price" onChange={(e) => updateVariantField(stepIdx, variantIdx, "offerprice", e.target.value)} /></div>
                          <div><Label>Pack of</Label><Input value={variant.badge || ""} placeholder="e.g 1, 2, 3" onChange={(e) => updateVariantField(stepIdx, variantIdx, "badge", e.target.value)} /></div>
                          <div>
                            <Label>Upload Image</Label>
                            <ImageUpload value={variant.image} onChange={(val: any) => { const url = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; updateVariantField(stepIdx, variantIdx, "image", url); }} multiple={false} />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          <div><Label>Title</Label><Input value={variant.title || ""} placeholder="e.g. Stage 1 (Receding Hairline)" onChange={(e) => updateVariantField(stepIdx, variantIdx, "title", e.target.value)} /></div>
                          <div>
                            <Label>Select Product</Label>
                            <Select value={variant.product_id || ""} onValueChange={(val) => updateVariantField(stepIdx, variantIdx, "product_id", val)}>
                              <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                              <SelectContent>{(products || []).map((p: any) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Slug</Label>
                            <Input value={variant.slug || ""} placeholder="auto-generated-slug"
                              onChange={(e) => handleSlugManualEdit(stepIdx, variantIdx, e.target.value)}
                              readOnly
                            />
                            {variant.slug && <p className="text-xs text-gray-400 mt-1">/products/<span className="text-blue-500">{variant.slug}</span></p>}
                          </div>
                          {step.display_type !== "Text" && (
                            <div className="col-span-3">
                              <Label>Upload Image</Label>
                              <ImageUpload value={variant.image} onChange={(val: any) => { const url = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; updateVariantField(stepIdx, variantIdx, "image", url); }} multiple={false} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          ))}
          <Button type="button" onClick={addStep}>Add Step</Button>
        </div>
      </div>
    );
  }
  if (["Root Cause Section", "How Does It Do It Section", "Benefits Section", "Ingredients Section", "Treatment Kit Section"].includes(sType)) {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Item"
          addLabel="Add Item"
          onAdd={() => addSectionItem({ name: "", description: "", image: "" })}
          onRemove={removeSectionItem}
          renderItem={(item: any, itemIdx: number) => (
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Name</Label><Input value={item.name || ""} placeholder="Enter Name" onChange={(e) => updateSectionItem(itemIdx, "name", e.target.value)} /></div>
              <div><Label>Description</Label><Input value={item.description || ""} placeholder="Enter Description" onChange={(e) => updateSectionItem(itemIdx, "description", e.target.value)} /></div>
              <div>
                <Label>Image</Label>
                <ImageUpload value={item.image || ""} onChange={(val: any) => { const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; updateSectionItem(itemIdx, "image", image); }} multiple={false} />
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "Treatment Journey Section") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <div>
          <Label>Section Image</Label>
          <ImageUpload value={data.image || ""} onChange={(val: any) => { const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; updateSectionField("image", image); }} multiple={false} />
        </div>
        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Item"
          addLabel="Add Item"
          onAdd={() => addSectionItem({ title: "", description: "", image: "" })}
          onRemove={removeSectionItem}
          renderItem={(item: any, itemIdx: number) => (
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Title</Label><Input value={item.title || ""} placeholder="Enter Title" onChange={(e) => updateSectionItem(itemIdx, "title", e.target.value)} /></div>
              <div><Label>Description</Label><Input value={item.description || ""} placeholder="Enter Description" onChange={(e) => updateSectionItem(itemIdx, "description", e.target.value)} /></div>
              <div>
                <Label>Image</Label>
                <ImageUpload value={item.image || ""} onChange={(val: any) => { const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; updateSectionItem(itemIdx, "image", image); }} multiple={false} />
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "use and Others points") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Point"
          addLabel="Add Point"
          onAdd={() => addSectionItem({ name: "", description: "" })}
          onRemove={removeSectionItem}
          renderItem={(item: any, itemIdx: number) => (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Us (Point)</Label><Input value={item.name || ""} placeholder="Enter Us Point" onChange={(e) => updateSectionItem(itemIdx, "name", e.target.value)} /></div>
              <div><Label>Others (Point)</Label><Input value={item.description || ""} placeholder="Enter Others Point" onChange={(e) => updateSectionItem(itemIdx, "description", e.target.value)} /></div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "Image Banner Section") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Banner"
          addLabel="Add Banner"
          onAdd={() => addSectionItem({ title: "", description: "", image: "" })}
          onRemove={removeSectionItem}
          renderItem={(item: any, itemIdx: number) => (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={item.title || ""} placeholder="Enter title" onChange={(e) => updateSectionItem(itemIdx, "title", e.target.value)} /></div>
                <div><Label>Description</Label><Input value={item.description || ""} placeholder="Enter description" onChange={(e) => updateSectionItem(itemIdx, "description", e.target.value)} /></div>
              </div>
              <div className="mt-4">
                <Label>Banner Image</Label>
                <ImageUpload value={item.image || ""} onChange={(val: any) => { const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; updateSectionItem(itemIdx, "image", image); }} multiple={false} />
              </div>
            </>
          )}
        />
      </div>
    );
  }
  if (sType === "Why Choose Unity Hair") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Item"
          addLabel="Add Item"
          onAdd={() => addSectionItem({ title: "", description: "", image: "" })}
          onRemove={removeSectionItem}
          renderItem={(item: any, itemIdx: number) => (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="Enter Title"
                  value={item.title || ""}
                  onChange={(e) => updateSectionItem(itemIdx, "title", e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="Enter Description"
                  value={item.description || ""}
                  onChange={(e) => updateSectionItem(itemIdx, "description", e.target.value)}
                />
              </div>
              <div>
                <Label>Image</Label>
                <ImageUpload value={item.image || ""} onChange={(val: any) => { const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; updateSectionItem(itemIdx, "image", image); }} multiple={false} />
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "Before & After") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Item"
          addLabel="Add Item"
          onAdd={() => addSectionItem({ title: "", description: "", beforeImage: "", afterImage: "" })}
          onRemove={removeSectionItem}
          renderItem={(item: any, itemIdx: number) => (
            <div className="grid grid-cols-4 gap-4">
              <div><Label>Title</Label><Input placeholder="Enter Title" value={item.title || ""} onChange={(e) => updateSectionItem(itemIdx, "title", e.target.value)} /></div>
              <div><Label>Description</Label><Input placeholder="Enter Description" value={item.description || ""} onChange={(e) => updateSectionItem(itemIdx, "description", e.target.value)} /></div>
              <div>
                <Label>Before Image</Label>
                <ImageUpload value={item.beforeImage || ""} onChange={(val: any) => { const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; updateSectionItem(itemIdx, "beforeImage", image); }} multiple={false} />
              </div>
              <div>
                <Label>After Image</Label>
                <ImageUpload value={item.afterImage || ""} onChange={(val: any) => { const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; updateSectionItem(itemIdx, "afterImage", image); }} multiple={false} />
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "FAQ 1" || sType === "FAQ 2") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <DraggableItemList
          items={data.questions || []}
          onReorder={updateFaqItems}
          itemLabel="Question"
          addLabel="Add Question"
          onAdd={addFaqQuestion}
          onRemove={removeFaqQuestion}
          renderItem={(faq: any, faqIdx: number) => (
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Question</Label><Input placeholder="Enter Question" value={faq.question || ""} onChange={(e) => updateFaqQuestion(faqIdx, "question", e.target.value)} /></div>
              <div><Label>Answer</Label><Input placeholder="Enter Answer" value={faq.answer || ""} onChange={(e) => updateFaqQuestion(faqIdx, "answer", e.target.value)} /></div>
              <div>
                <Label>Image</Label>
                <ImageUpload value={faq.image || ""} onChange={(val: any) => { const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; updateFaqQuestion(faqIdx, "image", image); }} multiple={false} />
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "Solution By Stage Section") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Stage"
          addLabel="Add Stage"
          onAdd={() => addSectionItem({ title: "", description: "", image: "", product_id: "" })}
          onRemove={removeSectionItem}
          renderItem={(item: any, itemIdx: number) => (
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Title</Label><Input value={item.title || ""} placeholder="Enter Title" onChange={(e) => updateSectionItem(itemIdx, "title", e.target.value)} /></div>
              <div><Label>Description</Label><Input value={item.description || ""} placeholder="Enter Description" onChange={(e) => updateSectionItem(itemIdx, "description", e.target.value)} /></div>

              <div>
                <Label className="font-semibold text-gray-700">
                  Video <span className="text-gray-400 font-normal text-xs">(Max 10MB)</span>
                </Label>

                <VideoUpload
                  value={item.image || null}
                  uploading={item.videoUploading || false}
                  onChange={(url) => {
                    updateSectionItem(itemIdx, "image", url);
                  }}
                  onUploadingChange={(loading) => {
                    updateSectionItem(itemIdx, "videoUploading", loading);
                  }}
                />
              </div>

              <div>
                <Label>Select Product</Label>
                <Select value={item.product_id || ""} onValueChange={(val) => updateSectionItem(itemIdx, "product_id", val)}>
                  <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                  <SelectContent>{(products || []).filter((p: any) => p._id !== id).map((p: any) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "Product Recommendation Section") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Recommendation"
          addLabel="Add Recommendation"
          onAdd={() => addSectionItem({ title: "", description: "", product_id: "" })}
          onRemove={removeSectionItem}
          renderItem={(item: any, itemIdx: number) => (
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Title</Label><Input value={item.title || ""} placeholder="Enter Title" onChange={(e) => updateSectionItem(itemIdx, "title", e.target.value)} /></div>
              <div><Label>Description</Label><Input value={item.description || ""} placeholder="Enter Description" onChange={(e) => updateSectionItem(itemIdx, "description", e.target.value)} /></div>
              <div>
                <Label>Select Product</Label>
                <Select value={item.product_id || ""} onValueChange={(val) => updateSectionItem(itemIdx, "product_id", val)}>
                  <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                  <SelectContent>{(products || []).filter((p: any) => p._id !== id).map((p: any) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "Product Attribute Section") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />
        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Attribute"
          addLabel="Add Attribute"
          onAdd={() => addSectionItem({ key: "", value: "" })}
          onRemove={removeSectionItem}
          renderItem={(item: any, itemIdx: number) => (
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Key</Label><Input value={item.key || ""} placeholder="e.g. Material, Color" onChange={(e) => updateSectionItem(itemIdx, "key", e.target.value)} /></div>
              <div><Label>Value</Label><Input value={item.value || ""} placeholder="e.g. Cotton, Red" onChange={(e) => updateSectionItem(itemIdx, "value", e.target.value)} /></div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "Additional Information Section") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />

        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Information"
          addLabel="Add Information"
          onAdd={() =>
            addSectionItem({
              net_quantity: "",
              manufactured_by: "",
              marketed_by: "",
              country_origin: "",
              product_dimensions: "",
              best_before: "",
            })
          }
          onRemove={removeSectionItem}
          renderItem={(item, itemIdx) => (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Net Quantity</Label>
                <Input
                  value={item.net_quantity || ""}
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "net_quantity",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>Manufactured By</Label>
                <Input
                  value={item.manufactured_by || ""}
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "manufactured_by",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>Marketed By</Label>
                <Input
                  value={item.marketed_by || ""}
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "marketed_by",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>Country Origin</Label>
                <Input
                  value={item.country_origin || ""}
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "country_origin",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>Product Dimensions</Label>
                <Input
                  value={item.product_dimensions || ""}
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "product_dimensions",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>Best Before</Label>
                <Input
                  value={item.best_before || ""}
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "best_before",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "Daily Usage Section") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) =>
            updateSectionField("status", val)
          }
          onTitleChange={(val) =>
            updateSectionField("title", val)
          }
          onDescriptionChange={(val) =>
            updateSectionField("description", val)
          }
        />

        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Usage Item"
          addLabel="Add Usage Item"
          onAdd={() =>
            addSectionItem({
              image: "",
              title: "",
              description: "",
            })
          }
          onRemove={removeSectionItem}
          renderItem={(item, itemIdx) => (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Image</Label>
                <ImageUpload
                  value={item.image || ""}
                  onChange={(val) => {
                    const image =
                      typeof val === "string"
                        ? val
                        : Array.isArray(val)
                          ? val[0]
                          : "";

                    updateSectionItem(
                      itemIdx,
                      "image",
                      image
                    );
                  }}
                  multiple={false}
                />
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={item.title || ""}
                  placeholder="One gummy per day"
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "title",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full border rounded-md p-2"
                  rows={5}
                  value={item.description || ""}
                  placeholder="Enter Description"
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "description",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "How to use") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />

        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Step"
          addLabel="Add Step"
          onAdd={() =>
            addSectionItem({
              image: "",
              title: "",
              description: "",
            })
          }
          onRemove={removeSectionItem}
          renderItem={(item, itemIdx) => (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Image</Label>
                <ImageUpload
                  value={item.image || ""}
                  onChange={(val) => {
                    const image =
                      typeof val === "string"
                        ? val
                        : Array.isArray(val)
                          ? val[0]
                          : "";

                    updateSectionItem(itemIdx, "image", image);
                  }}
                  multiple={false}
                />
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={item.title || ""}
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "title",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  rows={4}
                  className="w-full border rounded-md p-2"
                  value={item.description || ""}
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "description",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "Other Recommended Solutions") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) => updateSectionField("status", val)}
          onTitleChange={(val) => updateSectionField("title", val)}
          onDescriptionChange={(val) => updateSectionField("description", val)}
        />

        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Product"
          addLabel="Add Product"
          onAdd={() =>
            addSectionItem({
              product_id: "",
            })
          }
          onRemove={removeSectionItem}
          renderItem={(item, itemIdx) => (



            <div className="grid grid-cols-3 gap-4">


              <div><Label>Title</Label><Input value={item.title || ""} placeholder="Enter Title" onChange={(e) => updateSectionItem(itemIdx, "title", e.target.value)} /></div>
              <div><Label>Description</Label><Input value={item.description || ""} placeholder="Enter Description" onChange={(e) => updateSectionItem(itemIdx, "description", e.target.value)} /></div>
              <div>
                <Label>Select Product</Label>

                <Select
                  value={item.product_id || ""}
                  onValueChange={(val) =>
                    updateSectionItem(
                      itemIdx,
                      "product_id",
                      val
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>

                  <SelectContent>
                    {(products || [])
                      .filter((p) => p._id !== id)
                      .map((p) => (
                        <SelectItem
                          key={p._id}
                          value={p._id}
                        >
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (sType === "Result Section") {
    return (
      <div className="space-y-4">
        <CommonHeader
          sType={sType}
          status={data.status}
          title={data.title || ""}
          description={data.description || ""}
          onStatusChange={(val) =>
            updateSectionField("status", val)
          }
          onTitleChange={(val) =>
            updateSectionField("title", val)
          }
          onDescriptionChange={(val) =>
            updateSectionField("description", val)
          }
        />

        <DraggableItemList
          items={data.items || []}
          onReorder={updateSectionItems}
          itemLabel="Review"
          addLabel="Add Review"
          onAdd={() =>
            addSectionItem({
              beforeImage: "",
              afterImage: "",
              reviewDescription: "",
              customerName: "",
              customerAge: "",
              verifiedReview: true,
              stageLabel: "",
            })
          }
          onRemove={removeSectionItem}
          renderItem={(item, itemIdx) => (
            <div className="grid grid-cols-2 gap-4">

              <div>
                <Label>Stage Label</Label>
                <Input
                  value={item.stageLabel || ""}
                  placeholder="Stage 3"
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "stageLabel",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>Customer Name</Label>
                <Input
                  value={item.customerName || ""}
                  placeholder="Arjun Malhotra"
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "customerName",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  value={item.customerAge || ""}
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "customerAge",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Label>Verified Review</Label>
                <Switch
                  checked={item.verifiedReview !== false}
                  onCheckedChange={(checked) =>
                    updateSectionItem(
                      itemIdx,
                      "verifiedReview",
                      checked
                    )
                  }
                />
              </div>

              <div>
                <Label>Before Image</Label>
                <ImageUpload
                  value={item.beforeImage || ""}
                  onChange={(val) =>
                    updateSectionItem(
                      itemIdx,
                      "beforeImage",
                      typeof val === "string"
                        ? val
                        : val?.[0] || ""
                    )
                  }
                  multiple={false}
                />
              </div>

              <div>
                <Label>After Image</Label>
                <ImageUpload
                  value={item.afterImage || ""}
                  onChange={(val) =>
                    updateSectionItem(
                      itemIdx,
                      "afterImage",
                      typeof val === "string"
                        ? val
                        : val?.[0] || ""
                    )
                  }
                  multiple={false}
                />
              </div>

              <div className="col-span-2">
                <Label>Review Description</Label>
                <textarea
                  rows={5}
                  className="w-full border rounded-md p-2"
                  value={item.reviewDescription || ""}
                  onChange={(e) =>
                    updateSectionItem(
                      itemIdx,
                      "reviewDescription",
                      e.target.value
                    )
                  }
                />
              </div>

            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CommonHeader
        sType={sType}
        status={data.status}
        title={data.title || ""}
        description={data.description || ""}
        onStatusChange={(val) => updateSectionField("status", val)}
        onTitleChange={(val) => updateSectionField("title", val)}
        onDescriptionChange={(val) => updateSectionField("description", val)}
      />
    </div>
  );
});

export default function ProductFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const { categories: subCategories } = useSelector((state: RootState) => state.subcategori);
  const { brands } = useSelector((state: RootState) => state.brands);
  const { types } = useSelector((state: RootState) => state.types);
  const { products, duplicating } = useSelector((state: RootState) => state.products);
  const { labels: productLabels } = useSelector((state: RootState) => state.productLabels);
  const [name, setName] = useState("");
  const [tag, settag] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [categoryId, setCategoryId] = useState<string[]>([]);
  const [images, setImages] = useState("");
  const [status, setStatus] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [order, setOrder] = useState("");
  const [createdId, setCreatedId] = useState<string | undefined>(id);
  const effectiveEditMode = Boolean(createdId);

  const [variants, setVariants] = useState([
    {
      brand_id: "", type_id: "", price: "", stock_quantity: "0",
      sku: "", offerprice: "", ProductHeight: "", ProductWeight: "",
      ProductWidth: "", ProductLength: "", Manufactured: "", CountryOrigin: "",
      Marketed: "", barcode: "", images: [] as string[], labels: [] as string[],
      status: "active", is_featured: false, is_best_seller: false, is_trending: false,
      description: "", steps: "",
      videos: [] as string[],
      // shippingChargeType: "null",
      // shippingChargeValue: "0",
    },
  ]);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchsubCategories({ page: 1, limit: 100, status: "active" }) as any);
    dispatch(fetchProducts({ page: 1, limit: 100, status: "active" }) as any);
    dispatch(fetchBrands({ page: 1, limit: 100, status: "active" }) as any);
    dispatch(fetchTypes({ page: 1, limit: 100, status: "active" }) as any);
    dispatch(fetchProductLabels({ page: 1, limit: 100, status: "active" }) as any);
  }, [dispatch]);

  useEffect(() => {
    if (subCategories.length > 0) {
      setCategoryId((prev) => prev.filter((cid) => subCategories.some((c: any) => c._id === cid)));
    }
  }, [subCategories]);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getProductById(id) as any).then((res: any) => {
        if (res.payload) {
          const p = res.payload.data || res.payload;
          setName(p.name || "");
          settag(p.tag || "");
          setOrder(
            p.order?.toString() || ""
          );
          setDescription(p.description || "");
          setSteps(p.steps || "");
          const catIds = Array.isArray(p.category_id) ? p.category_id.map((cat: any) => cat?._id || cat) : [];
          setCategoryId(catIds);
          setImages(p.images || "");
          setStatus(p.status === "active");
          setIsHidden(p.ishidden || false);
          if (Array.isArray(p.variants) && p.variants.length > 0) {
            setVariants(p.variants.map((v: any) => ({
              _id: v._id,
              brand_id: v.brand_id?._id || "",
              type_id: v.type_id?._id || "",
              price: v.price || "",
              stock_quantity: v.stock_quantity || "0",
              sku: v.sku || "",
              offerprice: v.offerprice || "",
              ProductWeight: v.ProductWeight || "",
              ProductHeight: v.ProductHeight || "",
              ProductWidth: v.ProductWidth || "",
              ProductLength: v.ProductLength || "",
              CountryOrigin: v.CountryOrigin || "",
              Manufactured: v.Manufactured || "",
              Marketed: v.Marketed || "",
              barcode: v.barcode || "",
              status: v.status || "active",
              images: v.images || [],
              labels: Array.isArray(v.labels) ? v.labels : [],
              is_featured: !!v.is_featured,
              is_best_seller: !!v.is_best_seller,
              is_trending: !!v.is_trending,
              steps: v.steps || "",
              description: v.description || "",
              videos: Array.isArray(v.videos) ? v.videos : [],
              // shippingChargeType: v.shippingChargeType || "null",
              // shippingChargeValue: v.shippingChargeValue ?? "0",
            })));
          }

          if (Array.isArray(p.sections) && p.sections.length > 0) {
            const cleanedSections = p.sections.map((section: any) => {
              const type = section.type;
              const data = section.data || {};

              if (type === "Multi Step Selection") return section;

              if (type === "FAQ 1" || type === "FAQ 2") {
                return {
                  ...section,
                  data: {
                    ...data,
                    items: [],
                    questions: (data.questions || []).map((q: any) => ({
                      question: q.question || "",
                      answer: q.answer || "",
                      image: q.image || "",
                    })),
                  },
                };
              }

              if (type === "Additional Information Section") {
                return {
                  ...section,
                  data: {
                    ...data,
                    items: (data.items || []).map((item: any) => ({
                      net_quantity: item.net_quantity || "",
                      manufactured_by: item.manufactured_by || "",
                      marketed_by: item.marketed_by || "",
                      country_origin: item.country_origin || "",
                      product_dimensions: item.product_dimensions || "",
                      best_before: item.best_before || "",
                    })),
                  },
                };
              }

              if (type === "Before & After") {
                return {
                  ...section,
                  data: {
                    ...data,
                    items: (data.items || []).map((item: any) => ({
                      title: item.title || "",
                      description: item.description || "",
                      beforeImage: item.beforeImage || "",
                      afterImage: item.afterImage || "",
                    })),
                  },
                };
              }

              if (type === "Product Attribute Section") {
                return {
                  ...section,
                  data: {
                    ...data,
                    items: (data.items || []).map((item: any) => ({
                      key: item.key || "",
                      value: item.value || "",
                    })),
                  },
                };
              }

              if (type === "use and Others points") {
                return {
                  ...section,
                  data: {
                    ...data,
                    items: (data.items || []).map((item: any) => ({
                      name: item.name || "",
                      description: item.description || "",
                    })),
                  },
                };
              }

              if (
                type === "Solution By Stage Section" ||
                type === "Product Recommendation Section" ||
                type === "Other Recommended Solutions"
              ) {
                return {
                  ...section,
                  data: {
                    ...data,
                    items: (data.items || []).map((item: any) => ({
                      title: item.title || "",
                      description: item.description || "",
                      image: item.image || "",
                      product_id: item.product_id || null,
                      videoUploading: false,
                    })),
                  },
                };
              }

              if (
                type === "Root Cause Section" ||
                type === "How Does It Do It Section" ||
                type === "Benefits Section" ||
                type === "Ingredients Section" ||
                type === "Treatment Kit Section"
              ) {
                return {
                  ...section,
                  data: {
                    ...data,
                    items: (data.items || []).map((item: any) => ({
                      name: item.name || "",
                      description: item.description || "",
                      image: item.image || "",
                    })),
                  },
                };
              }

              if (type === "Result Section") {
                return {
                  ...section,
                  data: {
                    ...data,
                    items: (data.items || []).map((item) => ({
                      beforeImage: item.beforeImage || "",
                      afterImage: item.afterImage || "",
                      reviewDescription: item.reviewDescription || "",
                      customerName: item.customerName || "",
                      customerAge: item.customerAge || "",
                      verifiedReview:
                        item.verifiedReview !== undefined
                          ? item.verifiedReview
                          : true,
                      stageLabel: item.stageLabel || "",
                    })),
                  },
                };
              }

              return {
                ...section,
                data: {
                  ...data,
                  items: (data.items || []).map((item: any) => ({
                    title: item.title || "",
                    description: item.description || "",
                    image: item.image || "",
                  })),
                },
              };
            });

            setSections(cleanedSections);
          }
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    const firstVariant = variants?.[0];
    if (!firstVariant) return;

    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      let msIdx = updatedSections.findIndex((s) => s.type === "Multi Step Selection");

      if (msIdx === -1) {
        updatedSections.push({
          type: "Multi Step Selection",
          data: {
            title: "Pack Selection",
            steps: [{
              title: "Choose Pack",
              display_type: "Pack",
              variants: [{
                badge: 1,
                price: firstVariant.price || "",
                offerprice: firstVariant.offerprice || "",
                image: firstVariant.images?.[0] || "",
                auto_created: true,
              }],
            }],
          },
        });
        return updatedSections;
      }

      const firstStep = updatedSections[msIdx]?.data?.steps?.[0];
      if (!firstStep) return updatedSections;

      firstStep.display_type = "Pack";
      if (!firstStep.variants) firstStep.variants = [];

      const packOneIdx = firstStep.variants.findIndex((v: any) => Number(v.badge) === 1);
      const packOneData = {
        badge: 1,
        price: firstVariant.price || "",
        offerprice: firstVariant.offerprice || "",
        image: firstVariant.images?.[0] || "",
        auto_created: true,
      };

      if (packOneIdx === -1) {
        firstStep.variants.unshift(packOneData);
      } else {
        firstStep.variants[packOneIdx] = { ...firstStep.variants[packOneIdx], ...packOneData };
      }
      return updatedSections;
    });
  }, [variants]);

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updatedVariants = [...variants];
    if (field === "stock_quantity" && Number(value) < 0) return;
    (updatedVariants[index] as any)[field] = value;
    setVariants(updatedVariants);

    if (index === 0 && (field === "price" || field === "offerprice" || field === "images")) {
      setSections((prevSections) => {
        const updatedSections = [...prevSections];
        const msIdx = updatedSections.findIndex((s) => s.type === "Multi Step Selection");
        if (msIdx === -1) return prevSections;
        const firstStep = updatedSections[msIdx]?.data?.steps?.[0];
        if (!firstStep) return prevSections;
        const packOneIdx = firstStep.variants?.findIndex((v: any) => Number(v.badge) === 1);
        if (packOneIdx === -1) return prevSections;
        if (field === "price") firstStep.variants[packOneIdx].price = value;
        if (field === "offerprice") firstStep.variants[packOneIdx].offerprice = value;
        if (field === "images") firstStep.variants[packOneIdx].image = value?.[0] || "";
        return [...updatedSections];
      });
    }
  };

  const addSection = (type: string, insertAfterIdx: number) => {
    const newSection = { type, data: buildSectionData(type) };
    setSections((prev) => {
      const updated = [...prev];
      if (insertAfterIdx !== undefined && insertAfterIdx >= 0) {
        updated.splice(insertAfterIdx + 1, 0, newSection);
      } else {
        updated.push(newSection);
      }
      return updated;
    });
  };

  const removeSection = (idx: number) => setSections(sections.filter((_, i) => i !== idx));

  const sectionDrag = useDragList(sections, setSections);

  const handleDuplicate = async () => {
    if (!id) return;
    const result = await dispatch(duplicateProduct(id) as any);
    if (duplicateProduct.fulfilled.match(result)) {
      toast.success("Product duplicate successfully created!");
      const newProduct = result.payload?.product || result.payload;
      if (newProduct?._id) navigate(`${basePath}/products/${newProduct._id}/edit`);
      else navigate(`${basePath}/products`);
    } else {
      toast.error((result.payload) || "Duplicate failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Product Name is required");
    if (categoryId.length === 0) return toast.error("Category is required");
    if (variants.length === 0) return toast.error("Add at least one variant");

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i] as any;

      if (!v.brand_id) {
        return toast.error(`Brand field is required.`);
      }

      if (!v.type_id) {
        return toast.error(`Type field is required.`);
      }



      if (!v.price) {
        return toast.error(`Price field is required.`);
      }

      if (!v.stock_quantity) {
        return toast.error(`Stock Quantity field is required.`);
      }

      if (!v.ProductWeight) {
        return toast.error(`Product Weight is required.`)
      }
    }

    const cleanSections = sections.map((section) => {
      if (section.type !== "Multi Step Selection") return section;
      return {
        ...section,
        data: {
          ...section.data,
          steps: (section.data.steps || []).map((step: any) => {
            if (step.display_type === "Pack") {
              const packExists = (step.variants || []).some((v: any) => Number(v.badge) === 1);
              const finalVariants = packExists ? step.variants : [
                { badge: 1, price: variants?.[0]?.price || 0, offerprice: variants?.[0]?.offerprice || 0, image: (variants?.[0] as any)?.images?.[0] || "", auto_created: true },
                ...(step.variants || []),
              ];
              return { ...step, variants: finalVariants };
            }
            return {
              ...step,
              variants: (step.variants || []).map((v: any) => {
                const { _slugManuallyEdited, ...cleanVariant } = v;
                return cleanVariant;
              }),
            };
          }),
        },
      };
    });

    const payload = {
      name, tag, description, steps, category_id: categoryId, images,
      status: status ? "active" : "inactive", ishidden: isHidden, variants, sections: cleanSections,
    };

    try {
      let result;
      if (effectiveEditMode && createdId) {
        result = await dispatch(updateProduct({ id: createdId, data: payload }) as any);
      } else {
        result = await dispatch(createProduct(payload) as any);
      }
      if (createProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
        if (!effectiveEditMode) {
          const payloadData = result.payload?.data || result.payload;
          const newProduct = payloadData?.product || payloadData;
          const newVariants = payloadData?.variants || [];

          if (newProduct?._id) setCreatedId(newProduct._id);

          if (Array.isArray(newVariants) && newVariants.length > 0) {
            setVariants(newVariants.map((v: any) => ({
              _id: v._id,
              brand_id: v.brand_id?._id || v.brand_id || "",
              type_id: v.type_id?._id || v.type_id || "",
              price: v.price ?? "",
              stock_quantity: v.stock_quantity ?? "0",
              sku: v.sku || "",
              offerprice: v.offerprice ?? "",
              ProductWeight: v.ProductWeight ?? "",
              ProductHeight: v.ProductHeight ?? "",
              ProductWidth: v.ProductWidth ?? "",
              ProductLength: v.ProductLength ?? "",
              CountryOrigin: v.CountryOrigin || "",
              Manufactured: v.Manufactured || "",
              Marketed: v.Marketed || "",
              barcode: v.barcode || "",
              status: v.status || "active",
              images: v.images || [],
              labels: Array.isArray(v.labels) ? v.labels : [],
              is_featured: !!v.is_featured,
              is_best_seller: !!v.is_best_seller,
              is_trending: !!v.is_trending,
              steps: v.steps || "",
              description: v.description || "",
              videos: Array.isArray(v.videos) ? v.videos : [],
              // shippingChargeType: v.shippingChargeType || "null",
              // shippingChargeValue: v.shippingChargeValue ?? "0",
            })));
          }
          dispatch(fetchProducts({ page: 1, limit: 100, status: "active" }) as any);

          toast.success("Product created successfully! Now you can add page sections.");
          navigate(`${basePath}/products`)
        } else {
          toast.success("Product updated successfully!");
          navigate(`${basePath}/products`);
        }
      }
    } catch (err) {
      toast.error("Server Error");
    }
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/products`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? "Edit Product" : "Add New Product"}</h1>
            <p className="text-gray-500 mt-1">{isEditMode ? "Update product details." : "Create a new product."}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="space-y-6 w-[75%]">
          <Card className="shadow-md border border-gray-200">
            <CardHeader><CardTitle className="text-lg font-semibold">Product Info</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3 ">
                <div>
                  <Label>Product Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>Product tag </Label>
                  <Input value={tag} onChange={(e) => settag(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Description</Label>
                  <TiptapEditor value={description} onChange={(val: string) => setDescription(val)} />
                </div>
                <div>
                  <Label>How To Use Steps</Label>
                  <TiptapEditor value={steps} onChange={(val: string) => setSteps(val)} />
                </div>
              </div>
              <div>
                <Label>SubCategory *</Label>
                <div className="border rounded-md p-3 min-h-[50px]">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {categoryId.map((cid) => {
                      const category = (subCategories as any[]).find((c) => c._id === cid);
                      return (
                        <div key={cid} className="bg-green-600 text-white px-3 py-1 rounded-md flex items-center gap-2 text-sm">
                          {category?.name}
                          <button type="button" onClick={() => setCategoryId(categoryId.filter((c) => c !== cid))}>×</button>
                        </div>
                      );
                    })}
                  </div>
                  <select className="w-full bg-transparent border rounded-md p-2" value=""
                    onChange={(e) => { const selectedId = e.target.value; if (selectedId && !categoryId.includes(selectedId)) setCategoryId([...categoryId, selectedId]); }}>
                    <option value="">Select SubCategory</option>
                    {(subCategories as any[]).filter((cat) => cat.parent_id).filter((cat) => !categoryId.includes(cat._id)).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label>Product Images</Label>
                <ImageUpload value={images} onChange={(val: any) => { const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : ""; setImages(image); }} multiple={false} />
              </div>

            </CardContent>
          </Card>

          <Card className="shadow-md border border-gray-200">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((v: any, idx) => (
                <div key={idx} className="p-4 border rounded space-y-3 relative">
                  <div>
                    <CardTitle className="text-lg font-semibold">Variant</CardTitle>
                  </div>
                  <div className="col-span-2 flex items-center justify-between mt-2">
                    <Label htmlFor={`variant-status-${idx}`}>Status</Label>
                    <Switch id={`variant-status-${idx}`} checked={v.status === "active"} onCheckedChange={(checked) => handleVariantChange(idx, "status", checked ? "active" : "inactive")} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Brand *</Label>
                      <Select value={v.brand_id} onValueChange={(val) => handleVariantChange(idx, "brand_id", val)}>
                        <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                        <SelectContent>{(brands as any[]).map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Type *</Label>
                      <Select value={v.type_id} onValueChange={(val) => handleVariantChange(idx, "type_id", val)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{(types as any[]).map((t) => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Price *</Label><Input type="number" value={v.price} onChange={(e) => handleVariantChange(idx, "price", e.target.value)} /></div>
                    <div><Label>Stock *</Label><Input type="number" value={v.stock_quantity} min={0} onChange={(e) => handleVariantChange(idx, "stock_quantity", e.target.value)} /></div>
                    <div><Label>SKU </Label><Input value={v.sku} onChange={(e) => handleVariantChange(idx, "sku", e.target.value)} /></div>
                    <div><Label>Offer Price </Label><Input type="number" value={v.offerprice} onChange={(e) => handleVariantChange(idx, "offerprice", e.target.value)} /></div>
                    <div><Label>Bar Code </Label><Input value={v.barcode} onChange={(e) => handleVariantChange(idx, "barcode", e.target.value)} /></div>
                    <div><Label>Manufactured By </Label><Input value={v.Manufactured} onChange={(e) => handleVariantChange(idx, "Manufactured", e.target.value)} /></div>
                    <div><Label>Marketed By </Label><Input value={v.Marketed} onChange={(e) => handleVariantChange(idx, "Marketed", e.target.value)} /></div>
                    <div><Label>Country Origin </Label><Input value={v.CountryOrigin} onChange={(e) => handleVariantChange(idx, "CountryOrigin", e.target.value)} /></div>
                    <div><Label>Product Length (cms) </Label><Input type="number" value={v.ProductLength} onChange={(e) => handleVariantChange(idx, "ProductLength", e.target.value)} /></div>
                    <div><Label>Product Width (cms) </Label><Input type="number" value={v.ProductWidth} onChange={(e) => handleVariantChange(idx, "ProductWidth", e.target.value)} /></div>
                    <div><Label>Product Height (cms) </Label><Input type="number" value={v.ProductHeight} onChange={(e) => handleVariantChange(idx, "ProductHeight", e.target.value)} /></div>
                    <div><Label>Product Weight (g)* </Label><Input type="number" value={v.ProductWeight} onChange={(e) => handleVariantChange(idx, "ProductWeight", e.target.value)} /></div>



                    {/* <div>
                      <Label>Shipping Charge Type</Label>
                      <Select
                        value={v.shippingChargeType || "null"}
                        onValueChange={(value) => {
                          handleVariantChange(idx, "shippingChargeType", value);
                          if (value === "null" || value === "free") {
                            handleVariantChange(idx, "shippingChargeValue", "0");
                          }
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select shipping charge type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">Default (Global Settings)</SelectItem>
                          <SelectItem value="free">Always Free</SelectItem>
                          <SelectItem value="fixed">Fixed (₹ per unit)</SelectItem>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(v.shippingChargeType === "fixed" || v.shippingChargeType === "percentage") && (
                      <div>
                        <Label>
                          {v.shippingChargeType === "percentage" ? "Charge (%)" : "Charge (₹ per unit)"}
                        </Label>
                        <Input
                          type="number"
                          value={v.shippingChargeValue || ""}
                          placeholder={v.shippingChargeType === "percentage" ? "e.g. 5" : "e.g. 50"}
                          onChange={(e) => handleVariantChange(idx, "shippingChargeValue", e.target.value)}
                        />
                      </div>
                    )} */}









                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-wrap gap-6 mt-4 col-span-2">
                      <div className="flex items-center gap-2"><Label>Featured</Label><Switch checked={v.is_featured} onCheckedChange={(val) => handleVariantChange(idx, "is_featured", val)} /></div>
                      <div className="flex items-center gap-2"><Label>Best Seller</Label><Switch checked={v.is_best_seller} onCheckedChange={(val) => handleVariantChange(idx, "is_best_seller", val)} /></div>
                      <div className="flex items-center gap-2"><Label>Trending</Label><Switch checked={v.is_trending} onCheckedChange={(val) => handleVariantChange(idx, "is_trending", val)} /></div>
                    </div>
                    <div className="col-span-2">
                      <Label>Variant Images</Label>
                      <DraggableImageList
                        images={v.images || []}
                        onChange={(imgs: string[]) => handleVariantChange(idx, "images", imgs)}
                        onAddMore={(newUrls: string[]) => {
                          const current = v.images || [];
                          handleVariantChange(idx, "images", [...current, ...newUrls]);
                        }}
                        apiUrlImage={import.meta.env.VITE_API_URL_IMAGE}
                      />
                    </div>




                    <div className="col-span-2 mt-4">
                      <Label className="font-semibold text-gray-700">
                        Videos <span className="text-gray-400 font-normal text-xs">(Max 15MB)</span>
                      </Label>
                      <DraggableVideoList
                        videos={v.videos || []}
                        onChange={(vids: string[]) => handleVariantChange(idx, "videos", vids)}
                        apiUrlImage={import.meta.env.VITE_API_URL_IMAGE}
                        multiple={true}
                      />
                    </div>



                    <div className="col-span-2">
                      <Label>Variant Labels</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(productLabels as any[]).map((label) => (
                          <label key={label._id} className="inline-flex items-center gap-2 cursor-pointer">

                            <input
                              type="checkbox"
                              checked={v.labels?.[0] === label._id}
                              onChange={() => {
                                handleVariantChange(idx, "labels", [label._id]);
                              }}
                              className="form-checkbox h-4 w-4 text-blue-600"
                            />
                            <span>{label.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {!createdId ? (
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={() => {
                  toast.error("Please create the product first before adding page sections.");
                }}
              >
                Add to product Page Section Builder
              </Button>
            </div>
          ) : (
            <Card className="shadow-md border border-gray-200">
              <CardHeader className="flex flex-col justify-center items-center">
                <CardTitle className="text-lg font-semibold">Page Section Builder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No sections yet. Click "Add Section" to get started.
                  </div>
                )}

                {sections.map((section, idx) => (
                  <div key={`${section.type}-${idx}`}>
                    <div
                      draggable
                      onDragStart={(e) => { sectionDrag.onDragStart(idx); e.dataTransfer.effectAllowed = "move"; }}
                      onDragOver={(e) => sectionDrag.onDragOver(e, idx)}
                      onDrop={(e) => sectionDrag.onDrop(e, idx)}
                      onDragLeave={sectionDrag.onDragLeave}
                      onDragEnd={sectionDrag.onDragEnd}
                      className={`p-4 border rounded-lg space-y-4 transition-all ${sectionDrag.dragOver === idx ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors" title="Drag to reorder section">
                            <GripVertical className="w-4 h-4" />
                          </span>
                          <h3 className="font-semibold text-gray-800">{section.type} {idx + 1}</h3>
                        </div>
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeSection(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <SectionRenderer
                        section={section}
                        idx={idx}
                        setSections={setSections}
                        products={products as any[]}
                        id={createdId}
                      />
                    </div>

                    <InsertBetweenSectionButton
                      insertAfterIdx={idx}
                      onInsert={(type: string) => addSection(type, idx)}
                    />
                  </div>
                ))}

                <AddFirstSectionButton onAdd={(type: string) => addSection(type, -1)} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="w-[25%]">
          <Card className="sticky top-5 flex flex-col gap-3">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between mt-2">
                <Label htmlFor="status">Active</Label>
                <Switch id="status" checked={status} onCheckedChange={setStatus} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <Label htmlFor="ishidden">Is Hidden</Label>
                <Switch
                  id="ishidden"
                  checked={isHidden}
                  onCheckedChange={setIsHidden}
                />
              </div>
              {/* <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  value={order}
                  min={0}
                  type="number"
                  placeholder="Enter order"
                  onChange={(e) =>
                    setOrder(e.target.value)
                  }
                />
              </div> */}

              <div className="flex">
                <Button type="submit" className="flex-1">
                  {effectiveEditMode ? "Update Product" : "Create Product"}
                </Button>
                <Button onClick={() => navigate(`${basePath}/products`)}
                  variant="outline"
                  className="w-full">Cancel</Button>
              </div>

              {isEditMode && (
                <>
                  <div className="flex gap-3">
                    <Button type="button" onClick={handleDuplicate} disabled={duplicating} className="flex items-center gap-2 !w-full">
                      <Copy className="h-4 w-4" />
                      {duplicating ? "Duplicating..." : "Duplicate Product"}
                    </Button>
                  </div>
                </>

              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div >
  );
}

