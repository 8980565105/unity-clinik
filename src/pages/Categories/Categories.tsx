// // import { Link } from "react-router-dom";
// // import { Button } from "@/components/ui/button";
// // import { Plus } from "lucide-react";
// // import { GenericTable } from "@/components/ui/adminTable";
// // import { useDispatch, useSelector } from "react-redux";
// // import { AppDispatch, RootState } from "@/store";
// // import { useBasePath } from "@/hooks/useBasePath";
// // import { useEffect, useState } from "react";
// // import {
// //   bulkDeleteCategories,
// //   deleteCategory,
// //   fetchCategories,
// //   updateCategoryStatus,
// // } from "@/features/categories/categoriesThunk";
// // import { fetchUsers } from "@/features/users/usersThunk";

// // export default function CategoriesPage() {
// //   const dispatch = useDispatch<AppDispatch>();
// //   const basePath = useBasePath();
// //   const { user } = useSelector((state: RootState) => state.auth);
// //   const isAdmin = user?.role === "admin";

// //   const [creatorsMap, setCreatorsMap] = useState<Record<string, string>>({});
// //   const [loaded, setLoaded] = useState(false);

// //   useEffect(() => {
// //     if (!isAdmin) {
// //       setLoaded(true);
// //       return;
// //     }

// //     dispatch(fetchUsers({ limit: 10 }))
// //       .unwrap()
// //       .then((payload: any) => {
// //         console.log("USERS PAYLOAD:", payload);
// //         const userList: any[] =
// //           payload?.users ??
// //           payload?.data?.users ??
// //           (Array.isArray(payload) ? payload : []);

// //         const map: Record<string, string> = {};
// //         userList.forEach((u: any) => {
// //           const id = u._id;

// //           const name =
// //             u.name ||
// //             `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
// //             u.email ||
// //             "Unknown";
// //           if (id) map[id] = name;
// //         });

// //         setCreatorsMap(map);
// //         setLoaded(true);
// //       })
// //       .catch(() => setLoaded(true));
// //   }, [dispatch]);

// //   const getCreatorName = (createdById?: string) => {
// //     if (!createdById) return "-";
// //     return creatorsMap[createdById] || "-";
// //   };

// //   const columns = [
// //     {
// //       key: "image_url",
// //       label: "Image",
// //       render: (item: any) =>
// //         item.image_url ? (
// //           <img
// //             src={`${import.meta.env.VITE_API_URL_IMAGE}${item.image_url}`}
// //             // src={`${item.image_url}`}
// //             alt={item.name}
// //             className="h-10 w-10 rounded-md object-cover border"
// //           />
// //         ) : (
// //           <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
// //             —
// //           </div>
// //         ),

// //     },
// //     { key: "name", label: "Name", },
// //     { key: "order", label: "Order", },

// //   ];

// //   if (!loaded) {
// //     return (
// //       <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
// //         Loading...
// //       </div>
// //     );
// //   }

// //   return (
// //     <GenericTable
// //       title="Categories"
// //       columns={columns}
// //       rowKey="_id"
// //       searchEnabled
// //       statusToggleEnabled
// //       filters={[
// //         { label: "Active", value: "active" },
// //         { label: "Inactive", value: "inactive" },
// //         { label: "Ascending Order", value: "asc" },
// //         { label: "Descending Order", value: "desc" },

// //       ]}

// //       fetchData={async ({ page, limit, search, status }) => {
// //         try {

// //           let apiStatus = status;
// //           let sort: "asc" | "desc" | undefined;

// //           if (status === "asc") {
// //             apiStatus = undefined;
// //             sort = "asc";
// //           }

// //           if (status === "desc") {
// //             apiStatus = undefined;
// //             sort = "desc";
// //           }

// //           const res = await dispatch(
// //             fetchCategories({
// //               page,
// //               limit,
// //               search,
// //               status: apiStatus as any,
// //               sort,
// //             })
// //           ).unwrap();

// //           return {
// //             data: res.categories,
// //             total: res.total,
// //           };

// //         } catch (err: any) {
// //           throw new Error(err);
// //         }
// //       }}
// //       deleteItem={async (id) => {
// //         try {
// //           await dispatch(deleteCategory(id)).unwrap();
// //         } catch (err: any) {
// //           throw new Error(err || "Failed to delete category");
// //         }
// //       }}
// //       bulkDeleteItems={async (ids) => {
// //         try {
// //           await dispatch(bulkDeleteCategories(ids)).unwrap();
// //         } catch (err: any) {
// //           throw new Error(err || "Failed to delete categories");
// //         }
// //       }}
// //       onStatusToggle={async (id, newStatus) => {
// //         try {
// //           await dispatch(
// //             updateCategoryStatus({
// //               id,
// //               status: newStatus ? "active" : "inactive",
// //             })
// //           ).unwrap();
// //         } catch (err: any) {
// //           throw new Error(err || "Failed to update status");
// //         }
// //       }}
// //       headerActions={
// //         <Link to={`${basePath}/categories/add`}>
// //           <Button className="flex items-center gap-2">
// //             <Plus className="h-4 w-4" /> Add Category
// //           </Button>
// //         </Link>
// //       }
// //     />
// //   );
// // }




// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { GripVertical } from "lucide-react";

// function SortableRow({ category, basePath }: any) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: category._id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.6 : 1,
//   };

//   return (
//     <tr ref={setNodeRef} style={style} className="border-b">
//       <td className="p-3 w-10">
//         <button {...attributes} {...listeners} className="cursor-grab">
//           <GripVertical className="h-4 w-4 text-gray-400" />
//         </button>
//       </td>
//       <td className="p-3">
//         {category.image_url ? (
//           <img
//             src={`${import.meta.env.VITE_API_URL_IMAGE}${category.image_url}`}
//             className="h-10 w-10 rounded-md object-cover border"
//           />
//         ) : (
//           <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">—</div>
//         )}
//       </td>
//       <td className="p-3">{category.name}</td>
//       <td className="p-3">{category.order}</td>
//     </tr>
//   );
// }

// export function SortableCategoryTable({ categories, onReorder }: any) {
//   const sensors = useSensors(useSensor(PointerSensor));

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = categories.findIndex((c: any) => c._id === active.id);
//     const newIndex = categories.findIndex((c: any) => c._id === over.id);

//     const newList = arrayMove(categories, oldIndex, newIndex).map(
//       (item: any, index: number) => ({ ...item, order: index })
//     );

//     onReorder(newList);
//   };

//   return (
//     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//       <table className="w-full border rounded-md">
//         <thead>
//           <tr className="bg-gray-50 text-left">
//             <th className="p-3 w-10"></th>
//             <th className="p-3">Image</th>
//             <th className="p-3">Name</th>
//             <th className="p-3">Order</th>
//           </tr>
//         </thead>
//         <tbody>
//           <SortableContext
//             items={categories.map((c: any) => c._id)}
//             strategy={verticalListSortingStrategy}
//           >
//             {categories.map((category: any) => (
//               <SortableRow key={category._id} category={category} />
//             ))}
//           </SortableContext>
//         </tbody>
//       </table>
//     </DndContext>
//   );
// }



import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import { useEffect, useState } from "react";
import {
  bulkDeleteCategories,
  deleteCategory,
  fetchCategories,
  updateCategoryStatus,
  reorderCategories,
} from "@/features/categories/categoriesThunk";
import { toast } from "sonner";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ListOrdered, Table as TableIcon } from "lucide-react";

function SortableRow({ category }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging ? "#f9fafb" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b">
      <td className="p-3 w-10">
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
      </td>
      <td className="p-3">
        {category.image_url ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${category.image_url}`}
            alt={category.name}
            className="h-10 w-10 rounded-md object-cover border"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
            —
          </div>
        )}
      </td>
      <td className="p-3">{category.name}</td>
      <td className="p-3">{category.order}</td>
    </tr>
  );
}

function SortableCategoryTable({ categories, onReorder }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c._id === active.id);
    const newIndex = categories.findIndex((c) => c._id === over.id);

    const newList = arrayMove(categories, oldIndex, newIndex).map(
      (item: any, index: number) => ({ ...item, order: index })
    );

    onReorder(newList);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3 w-10"></th>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Order</th>
            </tr>
          </thead>
          <tbody>
            <SortableContext
              items={categories.map((c: any) => c._id)}
              strategy={verticalListSortingStrategy}
            >
              {categories.map((category: any) => (
                <SortableRow key={category._id} category={category} />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </div>
    </DndContext>
  );
}

export default function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();

  const [sortMode, setSortMode] = useState(false);
  const [localCategories, setLocalCategories] = useState<any[]>([]);
  const [reorderLoading, setReorderLoading] = useState(false);

  const loadSortData = async () => {
    setReorderLoading(true);
    try {
      const res = await dispatch(
        fetchCategories({ page: 1, limit: 1000, sort: "asc" })
      ).unwrap();
      setLocalCategories(res.categories || []);
    } catch (err: any) {
      toast.error(err || "Failed to load categories");
    } finally {
      setReorderLoading(false);
    }
  };

  useEffect(() => {
    if (sortMode) {
      loadSortData();
    }
  }, [sortMode]);

  const handleReorder = async (newList: any[]) => {
    setLocalCategories(newList); 
    try {
      await dispatch(
        reorderCategories(
          newList.map((c) => ({ _id: c._id, order: c.order }))
        )
      ).unwrap();
    } catch (err: any) {
      toast.error(err || "Failed to update order");
      loadSortData(); 
    }
  };

  const columns = [
    {
      key: "image_url",
      label: "Image",
      render: (item: any) =>
        item.image_url ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${item.image_url}`}
            alt={item.name}
            className="h-10 w-10 rounded-md object-cover border"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
            —
          </div>
        ),
    },
    { key: "name", label: "Name" },
    // { key: "order", label: "Order" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-gray-500 mt-1">
            Manage and organize your categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSortMode((s) => !s)}
            className="flex items-center gap-2"
          >
            {sortMode ? (
              <>
                <TableIcon className="h-4 w-4" /> Back to Table
              </>
            ) : (
              <>
                <ListOrdered className="h-4 w-4" /> Reorder Categories
              </>
            )}
          </Button>
          {!sortMode && (
            <Link to={`${basePath}/categories/add`}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Category
              </Button>
            </Link>
          )}
        </div>
      </div>

      {sortMode ? (
        reorderLoading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            Loading...
          </div>
        ) : (
          <SortableCategoryTable
            categories={localCategories}
            onReorder={handleReorder}
          />
        )
      ) : (
        <GenericTable
          title="Categories"
          columns={columns}
          rowKey="_id"
          searchEnabled
          statusToggleEnabled
          filters={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Ascending Order", value: "asc" },
            { label: "Descending Order", value: "desc" },
          ]}
          fetchData={async ({ page, limit, search, status }) => {
            try {
              let apiStatus = status;
              let sort: "asc" | "desc" | undefined;

              if (status === "asc") {
                apiStatus = undefined;
                sort = "asc";
              }

              if (status === "desc") {
                apiStatus = undefined;
                sort = "desc";
              }

              const res = await dispatch(
                fetchCategories({
                  page,
                  limit,
                  search,
                  status: apiStatus as any,
                  sort,
                })
              ).unwrap();

              return {
                data: res.categories,
                total: res.total,
              };
            } catch (err: any) {
              throw new Error(err);
            }
          }}
          deleteItem={async (id) => {
            try {
              await dispatch(deleteCategory(id)).unwrap();
            } catch (err: any) {
              throw new Error(err || "Failed to delete category");
            }
          }}
          bulkDeleteItems={async (ids) => {
            try {
              await dispatch(bulkDeleteCategories(ids)).unwrap();
            } catch (err: any) {
              throw new Error(err || "Failed to delete categories");
            }
          }}
          onStatusToggle={async (id, newStatus) => {
            try {
              await dispatch(
                updateCategoryStatus({
                  id,
                  status: newStatus ? "active" : "inactive",
                })
              ).unwrap();
            } catch (err: any) {
              throw new Error(err || "Failed to update status");
            }
          }}
        />
      )}
    </div>
  );
}