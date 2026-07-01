// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { GenericTable } from "@/components/ui/adminTable";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store";
// import { bulkDeleteNavbarItems, deleteNavbarItem, fetchNavbar, updateNavbarItemStatus } from "@/features/navbar/navbarThunk";
// import { useBasePath } from "@/hooks/useBasePath";

// export default function NavbarPage() {
//   const dispatch = useDispatch<AppDispatch>();
//   const basePath = useBasePath();

//    const columns = [
//     {
//       key: "icon",
//       label: "icon",
//       width: "w-20",
//       render: (item: any) =>
//         item.icon ? (
//           <img
//             src={`${import.meta.env.VITE_API_URL_IMAGE}${item.icon}`}
//             alt={item.label}
//             className="h-10 w-10 rounded-md object-cover border border-gray-200"
//           />
//         ) : (
//           <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-300">
//             —
//           </div>
//         ),
//       exportValue: (item: any) => item.label, 
//     },
//     { key: "label", label: "Title" },
//     { key: "url", label: "URL" },
//     { key: "order", label: "Order" },
//     {
//       key: "createdAt",
//       label: "Created At",
//       render: (item: any) =>
//         item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
//     },
//   ];

//   return (
//     <GenericTable
//       title="Navbar"
//       columns={columns}
//       rowKey="_id"
//       searchEnabled
//       statusToggleEnabled
//       filters={[
//         { label: "Active", value: "active" },
//         { label: "Inactive", value: "inactive" },
//       ]}
//       fetchData={async ({ page, limit, search, status }) => {
//         try {
//           const res = await dispatch(
//             fetchNavbar({ page, limit, search, status })
//           ).unwrap();
//           return { data: res.navbars, total: res.total };
//         } catch (err: any) {
//           throw new Error(err || "Failed to load brands");
//         }
//       }}
//       deleteItem={async (id) => {
//         try {
//           await dispatch(deleteNavbarItem(id)).unwrap();
//         } catch (err: any) {
//           throw new Error(err || "Failed to delete brand");
//         }
//       }}
//       bulkDeleteItems={async (ids) => {
//         try {
//           await dispatch(bulkDeleteNavbarItems(ids)).unwrap();
//         } catch (err: any) {
//           throw new Error(err || "Failed to delete brands");
//         }
//       }}
//       onStatusToggle={async (id, newStatus) => {
//         try {
//           await dispatch(
//             updateNavbarItemStatus({
//               id,
//               status: newStatus ? "active" : "inactive",
//             })
//           ).unwrap();
//         } catch (err: any) {
//           throw new Error(err || "Failed to update status");
//         }
//       }}
//       headerActions={
//         <Link to={`${basePath}/navbar/add`}>
//           <Button className="flex items-center gap-2">
//             <Plus className="h-4 w-4" /> Add Navbar
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
import { useEffect, useState } from "react";
import {
  bulkDeleteNavbarItems,
  deleteNavbarItem,
  fetchNavbar,
  updateNavbarItemStatus,
  reorderNavbarItems,
} from "@/features/navbar/navbarThunk";
import { useBasePath } from "@/hooks/useBasePath";
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

function SortableRow({ item }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

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
        {item.icon ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${item.icon}`}
            alt={item.label}
            className="h-10 w-10 rounded-md object-cover border"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
            —
          </div>
        )}
      </td>
      <td className="p-3">{item.label}</td>
      <td className="p-3">{item.url}</td>
      <td className="p-3">{item.order}</td>
    </tr>
  );
}

function SortableNavbarTable({ items, onReorder }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((c: any) => c._id === active.id);
    const newIndex = items.findIndex((c: any) => c._id === over.id);

    const newList = arrayMove(items, oldIndex, newIndex).map(
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
              <th className="p-3">Icon</th>
              <th className="p-3">Title</th>
              <th className="p-3">URL</th>
              <th className="p-3">Order</th>
            </tr>
          </thead>
          <tbody>
            <SortableContext
              items={items.map((c: any) => c._id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item: any) => (
                <SortableRow key={item._id} item={item} />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </div>
    </DndContext>
  );
}

export default function NavbarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();

  const [sortMode, setSortMode] = useState(false);
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [reorderLoading, setReorderLoading] = useState(false);

  const loadSortData = async () => {
    setReorderLoading(true);
    try {
      const res = await dispatch(
        fetchNavbar({ page: 1, limit: 1000 })
      ).unwrap();
      setLocalItems(
        [...(res.navbars || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    } catch (err: any) {
      toast.error(err || "Failed to load navbar items");
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
    setLocalItems(newList); // optimistic UI update
    try {
      await dispatch(
        reorderNavbarItems(
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
      key: "icon",
      label: "icon",
      width: "w-20",
      render: (item: any) =>
        item.icon ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${item.icon}`}
            alt={item.label}
            className="h-10 w-10 rounded-md object-cover border border-gray-200"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-300">
            —
          </div>
        ),
      exportValue: (item: any) => item.label,
    },
    { key: "label", label: "Title" },
    { key: "url", label: "URL" },
    // { key: "order", label: "Order" },
    {
      key: "createdAt",
      label: "Created At",
      render: (item: any) =>
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Navbar</h2>
          <p className="text-gray-500 mt-1">
            Manage and organize your navbar items
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
                <ListOrdered className="h-4 w-4" /> Reorder Navbar
              </>
            )}
          </Button>
          {!sortMode && (
            <Link to={`${basePath}/navbar/add`}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Navbar
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
          <SortableNavbarTable items={localItems} onReorder={handleReorder} />
        )
      ) : (
        <GenericTable
          title="Navbar"
          columns={columns}
          rowKey="_id"
          searchEnabled
          statusToggleEnabled
          filters={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          fetchData={async ({ page, limit, search, status }) => {
            try {
              const res = await dispatch(
                fetchNavbar({ page, limit, search, status })
              ).unwrap();
              return { data: res.navbars, total: res.total };
            } catch (err: any) {
              throw new Error(err || "Failed to load navbar items");
            }
          }}
          deleteItem={async (id) => {
            try {
              await dispatch(deleteNavbarItem(id)).unwrap();
            } catch (err: any) {
              throw new Error(err || "Failed to delete item");
            }
          }}
          bulkDeleteItems={async (ids) => {
            try {
              await dispatch(bulkDeleteNavbarItems(ids)).unwrap();
            } catch (err: any) {
              throw new Error(err || "Failed to delete items");
            }
          }}
          onStatusToggle={async (id, newStatus) => {
            try {
              await dispatch(
                updateNavbarItemStatus({
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