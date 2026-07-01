// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { GenericTable } from "@/components/ui/adminTable";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store";
// import { useBasePath } from "@/hooks/useBasePath";
// import {
//   bulkDeletesubCategories,
//   deletesubCategory,
//   fetchsubCategories,
//   updatesubCategoryStatus,
// } from "@/features/subcategories/subcategoriesThunk";

// export default function subCategoriesPage() {
//   const dispatch = useDispatch<AppDispatch>();
//   const basePath = useBasePath();
//   const columns = [
//     {
//       key: "image_url",
//       label: "Image",
//       render: (item: any) =>
//         item.image_url ? (
//           <img
//             src={`${import.meta.env.VITE_API_URL_IMAGE}${item.image_url}`}
//             alt={item.name}
//             className="h-10 w-10 rounded-md object-cover border"
//           />
//         ) : (

//           ""
//         ),

//     },
//     { key: "name", label: "Name", },
//     {
//       key: "parent_id",
//       label: "Parent",
//       render: (item: any) => item.parent_id?.name || "-",
//     },
//     { key: "order", label: "Order", },
//   ];

//   return (
//     <GenericTable
//       title="SubCategories"
//       columns={columns}
//       rowKey="_id"
//       searchEnabled
//       statusToggleEnabled
//       filters={[
//         { label: "Active", value: "active" },
//         { label: "Inactive", value: "inactive" },
//         { label: "Ascending Order", value: "asc" },
//         { label: "Descending Order", value: "desc" },

//       ]}

//       fetchData={async ({ page, limit, search, status }) => {
//         try {

//           let apiStatus = status;
//           let sort: "asc" | "desc" | undefined;

//           if (status === "asc") {
//             apiStatus = undefined;
//             sort = "asc";
//           }

//           if (status === "desc") {
//             apiStatus = undefined;
//             sort = "desc";
//           }

//           const res = await dispatch(
//             fetchsubCategories({
//               page,
//               limit,
//               search,
//               status: apiStatus as any,
//               sort,
//             })
//           ).unwrap();

//           return {
//             data: res.categories,
//             total: res.total,
//           };

//         } catch (err: any) {
//           throw new Error(err);
//         }
//       }}
//       deleteItem={async (id) => {
//         try {
//           await dispatch(deletesubCategory(id)).unwrap();
//         } catch (err: any) {
//           throw new Error(err || "Failed to delete category");
//         }
//       }}
//       bulkDeleteItems={async (ids) => {
//         try {
//           await dispatch(bulkDeletesubCategories(ids)).unwrap();
//         } catch (err: any) {
//           throw new Error(err || "Failed to delete categories");
//         }
//       }}
//       onStatusToggle={async (id, newStatus) => {
//         try {
//           await dispatch(
//             updatesubCategoryStatus({
//               id,
//               status: newStatus ? "active" : "inactive",
//             })
//           ).unwrap();
//         } catch (err: any) {
//           throw new Error(err || "Failed to update status");
//         }
//       }}
//       headerActions={
//         <Link to={`${basePath}/subcategories/add`}>
//           <Button className="flex items-center gap-2">
//             <Plus className="h-4 w-4" /> Add subCategory
//           </Button>
//         </Link>
//       }
//     />
//   );
// }



import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import { useEffect, useState } from "react";
import {
  bulkDeletesubCategories,
  deletesubCategory,
  fetchsubCategories,
  updatesubCategoryStatus,
  reorderSubCategories,
} from "@/features/subcategories/subcategoriesThunk";
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

function SortableRow({ subcategory }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subcategory._id });

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
        {subcategory.image_url ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${subcategory.image_url}`}
            alt={subcategory.name}
            className="h-10 w-10 rounded-md object-cover border"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
            —
          </div>
        )}
      </td>
      <td className="p-3">{subcategory.name}</td>
      <td className="p-3">{subcategory.parent_id?.name || "-"}</td>
      <td className="p-3">{subcategory.order}</td>
    </tr>
  );
}

function SortableSubCategoryTable({ subcategories, onReorder }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = subcategories.findIndex((c: any) => c._id === active.id);
    const newIndex = subcategories.findIndex((c: any) => c._id === over.id);

    const newList = arrayMove(subcategories, oldIndex, newIndex).map(
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
              <th className="p-3">Parent</th>
              <th className="p-3">Order</th>
            </tr>
          </thead>
          <tbody>
            <SortableContext
              items={subcategories.map((c: any) => c._id)}
              strategy={verticalListSortingStrategy}
            >
              {subcategories.map((subcategory: any) => (
                <SortableRow key={subcategory._id} subcategory={subcategory} />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </div>
    </DndContext>
  );
}

export default function subCategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();

  const [sortMode, setSortMode] = useState(false);
  const [localSubCategories, setLocalSubCategories] = useState<any[]>([]);
  const [reorderLoading, setReorderLoading] = useState(false);

  const loadSortData = async () => {
    setReorderLoading(true);
    try {
      const res = await dispatch(
        fetchsubCategories({ page: 1, limit: 1000, sort: "asc" })
      ).unwrap();
      setLocalSubCategories(res.categories || []);
    } catch (err: any) {
      toast.error(err || "Failed to load subcategories");
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
    setLocalSubCategories(newList); // optimistic UI update
    try {
      await dispatch(
        reorderSubCategories(
          newList.map((c) => ({ _id: c._id, order: c.order }))
        )
      ).unwrap();
    } catch (err: any) {
      toast.error(err || "Failed to update order");
      loadSortData(); // revert on failure
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
          ""
        ),
    },
    { key: "name", label: "Name" },
    {
      key: "parent_id",
      label: "Parent",
      render: (item: any) => item.parent_id?.name || "-",
    },
    // { key: "order", label: "Order" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SubCategories</h2>
          <p className="text-gray-500 mt-1">
            Manage and organize your subcategories
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
                <ListOrdered className="h-4 w-4" /> Reorder SubCategories
              </>
            )}
          </Button>
          {!sortMode && (
            <Link to={`${basePath}/subcategories/add`}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add subCategory
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
          <SortableSubCategoryTable
            subcategories={localSubCategories}
            onReorder={handleReorder}
          />
        )
      ) : (
        <GenericTable
          title="SubCategories"
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
                fetchsubCategories({
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
              await dispatch(deletesubCategory(id)).unwrap();
            } catch (err: any) {
              throw new Error(err || "Failed to delete category");
            }
          }}
          bulkDeleteItems={async (ids) => {
            try {
              await dispatch(bulkDeletesubCategories(ids)).unwrap();
            } catch (err: any) {
              throw new Error(err || "Failed to delete categories");
            }
          }}
          onStatusToggle={async (id, newStatus) => {
            try {
              await dispatch(
                updatesubCategoryStatus({
                  id,
                  status: newStatus ? "active" : "inactive",
                })
              ).unwrap();
            } catch (err: any) {
              throw new Error(err || "Failed to update status");
            }
          }}
          headerActions={null}
        />
      )}
    </div>
  );
}