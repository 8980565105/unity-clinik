// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { ArrowLeft } from "lucide-react";

// import { toast } from "sonner";
// import {
//   createsubCategory,
//   getsubCategoryById,
//   updatesubCategory,
// } from "@/features/subcategories/subcategoriesThunk";
// import { fetchCategories } from "@/features/categories/categoriesThunk";
// import { ImageUpload } from "@/components/ui/ImageUpload";
// import { useBasePath } from "@/hooks/useBasePath";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export default function SubCategoryFormPage() {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const isEditMode = Boolean(id);
//   const basePath = useBasePath();
//   const { categories } = useSelector((state: RootState) => state.categories);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [parentId, setParentId] = useState<string | null>(null);
//   const [status, setStatus] = useState(true);
//   const [imageUrl, setImageUrl] = useState<string | null>(null);


//   useEffect(() => {
//     dispatch(fetchCategories({ page: 1, limit: 100 }));
//   }, [dispatch]);

//   useEffect(() => {
//     if (isEditMode && id) {
//       dispatch(getsubCategoryById(id)).then((res: any) => {
//         if (res.payload) {
//           const cat = res.payload;
//           setName(cat.name || "");
//           setDescription(cat.description || "");
//           setParentId(cat.parent_id || null);
//           setStatus(cat.status === "active");
//           setImageUrl(cat.image_url || null);
//         }
//       });
//     }
//   }, [dispatch, id, isEditMode]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const payload = {
//       name,
//       description,
//       parent_id: parentId,
//       status: status ? "active" : "inactive",
//       image: imageUrl,
//     };

//     try {
//       let result;
//       if (isEditMode && id) {
//         result = await dispatch(updatesubCategory({ id, data: payload }));
//       } else {
//         result = await dispatch(createsubCategory(payload));
//       }

//       if (
//         createsubCategory.fulfilled.match(result) ||
//         updatesubCategory.fulfilled.match(result)
//       ) {
//         toast.success(
//           isEditMode
//             ? "subCategory updated successfully!"
//             : "subCategory created successfully!"
//         );
//         navigate(`${basePath}/subcategories`);

//       } else {
//         toast.error((result.payload as string) || "Something went wrong");
//       }
//     } catch (err) {
//       toast.error("Server Error");
//     }
//   };

//   return (
//     <div className="p-6 mx-auto">
//       <div className="flex items-center gap-4 mb-6">
//         <Link to={`${basePath}/subcategories`}>
//           <Button variant="ghost" size="icon">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//         </Link>
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             {isEditMode ? "Edit subCategory" : "Add New subCategory"}
//           </h1>
//           <p className="text-gray-500 mt-1">
//             {isEditMode
//               ? "Update subcategory details."
//               : "Create a new subcategory for your catalog."}
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">
//           <Card className="shadow-md border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold">
//                 Basic Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-5">
//               <div>
//                 <Label htmlFor="name">Category Name <span className="text-red-500">*</span></Label>
//                 <Input
//                   id="name"
//                   placeholder="Enter category name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   placeholder="Category description..."
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   className="mt-1 min-h-[120px]"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="parent">Parent Category</Label>
//                 <Select
//                   value={parentId ?? "none"}
//                   onValueChange={(val) =>
//                     setParentId(val === "none" ? null : val)
//                   }

//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="None" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="none">None</SelectItem>
//                     {categories
//                       .filter((cat) => cat._id !== id)
//                       .map((cat) => (
//                         <SelectItem key={cat._id} value={cat._id}>
//                           {cat.name}
//                         </SelectItem>
//                       ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Category Image</Label>
//                 <div className="mt-1">
//                   <ImageUpload
//                     value={imageUrl}
//                     onChange={(url) => setImageUrl(url as string | null)}
//                     size={150}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           <Card className="sticky top-6 shadow-md border border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold">Status</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="status">Active</Label>
//                 <Switch
//                   id="status"
//                   checked={status}
//                   onCheckedChange={(val) => setStatus(val)}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex gap-3">
//             <Button
//               type="submit"
//               className="flex-1 bg-blue-600 hover:bg-blue-700"
//             >
//               {isEditMode ? "Update subCategory" : "Create subCategory"}
//             </Button>
//             <Link to={`${basePath}/subcategories`} className="flex-1">
//               <Button type="button" variant="outline" className="w-full">
//                 Cancel
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import {
  createsubCategory,
  getsubCategoryById,
  updatesubCategory,
} from "@/features/subcategories/subcategoriesThunk";

import { fetchCategories } from "@/features/categories/categoriesThunk";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useBasePath } from "@/hooks/useBasePath";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SubCategoryFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();

  const { categories } = useSelector((state: RootState) => state.categories);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [status, setStatus] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getsubCategoryById(id)).then((res: any) => {
        if (res.payload) {
          const cat = res.payload;
          setName(cat.name || "");
          setDescription(cat.description || "");
          setParentId(
            typeof cat.parent_id === "object"
              ? cat.parent_id?._id || ""
              : cat.parent_id || ""
          );
          setStatus(cat.status === "active");
          setImageUrl(cat.image_url || null);
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parentId) {
      toast.error("Please select a parent category");
      return;
    }

    const payload = {
      name,
      description,
      parent_id: parentId,
      status: status ? "active" : "inactive",
      image: imageUrl,
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updatesubCategory({ id, data: payload }));
      } else {
        result = await dispatch(createsubCategory(payload));
      }

      if (
        createsubCategory.fulfilled.match(result) ||
        updatesubCategory.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode
            ? "SubCategory updated successfully!"
            : "SubCategory created successfully!"
        );
        navigate(`${basePath}/subcategories`);
      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch (err) {
      toast.error("Server Error");
    }
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/subcategories`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit SubCategory" : "Add New SubCategory"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode
              ? "Update subcategory details."
              : "Create a new subcategory for your catalog."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">
                  Subcategory Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter subcategory name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Subcategory description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="parent">
                  Parent Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={parentId}
                  onValueChange={(val) => setParentId(val)}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a parent category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="__loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {/* {!parentId && (
                  <p className="text-xs text-red-500 mt-1">
                    Parent category is required
                  </p>
                )} */}
              </div>

              <div>
                <Label>Subcategory Image</Label>
                <div className="mt-1">
                  <ImageUpload
                    value={imageUrl}
                    onChange={(url) => setImageUrl(url as string | null)}
                    size={150}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6 shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Active</Label>
                <Switch
                  id="status"
                  checked={status}
                  onCheckedChange={(val) => setStatus(val)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!parentId} // ✅ disable submit if no parent selected
            >
              {isEditMode ? "Update SubCategory" : "Create SubCategory"}
            </Button>
            <Link to={`${basePath}/subcategories`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}