// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Search, Plus, Edit2, Trash2, Download } from "lucide-react";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// import { AppDispatch, RootState } from "@/store";
// import { Checkbox } from "@/components/ui/checkbox";
// import { ConfirmDialog } from "@/components/ui/confirmDialog";
// import { toast } from "sonner";

// import {
//   fetchStores,
//   deleteStore,
//   bulkDeleteStores,
// } from "@/features/stores/storesThunk";

// export default function Stores() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { stores, total, loading } = useSelector((state: RootState) => state.stores);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedQuery, setDebouncedQuery] = useState("");
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [page, setPage] = useState(1);
//   const limit = 5;

//   // Debounce search
//   useEffect(() => {
//     const handler = setTimeout(() => setDebouncedQuery(searchQuery), 500);
//     return () => clearTimeout(handler);
//   }, [searchQuery]);

//   // Fetch stores
//   useEffect(() => {
//     dispatch(fetchStores({ page, limit, search: debouncedQuery }));
//   }, [debouncedQuery, page, dispatch]);

//   const handleDelete = async (id: string) => {
//     try {
//       await dispatch(deleteStore(id)).unwrap();
//       toast.success("Store deleted successfully.");
//     } catch (err: any) {
//       toast.error(err?.message || "Failed to delete store.");
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (!selectedIds.length) return;
//     try {
//       await dispatch(bulkDeleteStores(selectedIds)).unwrap();
//       toast.success(`${selectedIds.length} stores deleted successfully.`);
//       setSelectedIds([]);
//     } catch (err: any) {
//       toast.error(err?.message || "Failed to delete stores.");
//     }
//   };

//   const handleSelect = (id: string) =>
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
//     );

//   const handleDownload = async () => {
//     try {
//       const result = await dispatch(fetchStores({ page: 1, limit: 1000, search: debouncedQuery })).unwrap();
//       const data = result.stores.map((s: any) => ({
//         Name: s.name,
//         Email: s.email,
//         Phone: s.phone || "-",
//         Website: s.website || "-",
//         Status: s.status,
//         "Created At": s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "-",
//       }));

//       const worksheet = XLSX.utils.json_to_sheet(data);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Stores");

//       const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//       const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
//       saveAs(blob, `stores_${Date.now()}.xlsx`);
//     } catch (err) {
//       console.error("Download failed:", err);
//     }
//   };

//   const getStatusBadge = (status: string) => (
//     <span
//       className={`px-2 py-1 rounded-full text-xs font-semibold ${
//         status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//       }`}
//     >
//       {status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );

//   if (loading) return <div>Loading stores...</div>;
//   const totalPages = Math.ceil(total / limit);

//   return (
//     <div className="space-y-8 p-6 mx-auto">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Stores</h1>
//           <p className="text-sm text-gray-500">Manage your stores</p>
//         </div>
//         <div className="flex gap-2">
//           <Link to="/stores/add">
//             <Button className="flex items-center gap-2">
//               <Plus className="h-4 w-4" /> Add Store
//             </Button>
//           </Link>
//           <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
//             <Download className="h-4 w-4" /> Export
//           </Button>
//         </div>
//       </div>

//       {/* Search & Bulk Delete */}
//       <Card className="shadow-sm border border-gray-200">
//         <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
//           <div className="relative w-full md:max-w-sm">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//             <Input
//               placeholder="Search stores..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//           </div>

//           {selectedIds.length > 0 && (
//             <ConfirmDialog
//               title="Delete Selected Stores"
//               description={`This will delete ${selectedIds.length} selected stores.`}
//               confirmText="Delete All"
//               onConfirm={handleBulkDelete}
//               danger
//             >
//               <Button variant="destructive" className="flex items-center gap-2">
//                 <Trash2 className="h-4 w-4" /> Delete Selected
//               </Button>
//             </ConfirmDialog>
//           )}
//         </CardContent>
//       </Card>

//       {/* Stores Table */}
//       <Card className="shadow-sm border border-gray-200">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-lg font-semibold">
//             Stores
//              {/* <span className="text-gray-400 font-normal">({total})</span> */}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto rounded-lg border border-gray-200">
//             <table className="w-full text-sm border-collapse">
//               <thead className="bg-gray-50 text-gray-700 text-sm font-medium">
//                 <tr>
//                   <th className="p-3 text-left min-w-[40px]">
//                     <Checkbox
//                       checked={selectedIds.length === stores.length && stores.length > 0}
//                       onCheckedChange={(checked) =>
//                         setSelectedIds(checked ? stores.map((s) => s._id) : [])
//                       }
//                     />
//                   </th>
//                   <th className="p-3 text-left min-w-[150px]">Name</th>
//                   <th className="p-3 text-left min-w-[150px]">Email</th>
//                   <th className="p-3 text-left min-w-[120px]">Phone</th>
//                   <th className="p-3 text-left min-w-[120px]">Website</th>
//                   <th className="p-3 text-left min-w-[100px]">Status</th>
//                   <th className="p-3 text-left min-w-[120px]">Created At</th>
//                   <th className="p-3 text-right min-w-[100px]">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {stores.map((store) => (
//                   <tr key={store._id} className="hover:bg-gray-50 transition-colors">
//                     <td className="p-3">
//                       <Checkbox
//                         checked={selectedIds.includes(store._id)}
//                         onCheckedChange={() => handleSelect(store._id)}
//                       />
//                     </td>
//                     <td className="p-3 font-medium text-gray-900 truncate">{store.name}</td>
//                     <td className="p-3 text-gray-700 truncate">{store.email}</td>
//                     <td className="p-3 text-gray-700 truncate">{store.phone || "-"}</td>
//                     <td className="p-3 text-gray-700 truncate">{store.website || "-"}</td>
//                     <td className="p-3">{getStatusBadge(store.status || "inactive")}</td>
//                     <td className="p-3">{new Date(store.createdAt).toLocaleDateString()}</td>
//                     <td className="p-3 flex justify-end gap-2">
//                       <Link
//                         to={`/stores/${store._id}/edit`}
//                         className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition"
//                       >
//                         <Edit2 className="h-4 w-4" />
//                       </Link>
//                       <ConfirmDialog
//                         title="Delete Store"
//                         description={`This will permanently delete store "${store.name}".`}
//                         confirmText="Delete"
//                         onConfirm={() => handleDelete(store._id)}
//                         danger
//                       >
//                         <button className="p-1 text-red-600 hover:bg-red-50 rounded-md transition">
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </ConfirmDialog>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex items-center justify-end gap-2 mt-4">
//               <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
//                 Prev
//               </Button>
//               {Array.from({ length: totalPages }, (_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setPage(i + 1)}
//                   className={`px-3 py-1 rounded-md text-sm ${
//                     page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//               <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
//                 Next
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


import React from "react";
import { useDispatch } from "react-redux";
import { GenericTable } from "@/components/ui/adminTable";

import { AppDispatch } from "@/store";
import {
  fetchStores,
  deleteStore,
  bulkDeleteStores,
  updateStore,
} from "@/features/stores/storesThunk";

export default function Stores() {
  const dispatch = useDispatch<AppDispatch>();

  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
      render: (item: any) => item.phone || "-",
    },
    {
      key: "website",
      label: "Website",
      render: (item: any) => item.website || "-",
    },
    // {
    //   key: "status",
    //   label: "Status",
    // },
    {
      key: "createdAt",
      label: "Created At",
      render: (item: any) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "-",
    },
  ];

  return (
    <GenericTable
      title="Stores"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled
      editEnabled

      filters={[
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]}

      fetchData={async ({ page, limit, search, status }) => {
        try {
          const res = await dispatch(
            fetchStores({
              page,
              limit,
              search,
              status,
            })
          ).unwrap();

          const formatted = res.stores.map((store: any) => ({
            ...store,
            status: store.status || "inactive",
          }));

          return {
            data: formatted,
            total: res.total,
          };
        } catch (err: any) {
          throw new Error(err || "Failed to fetch stores");
        }
      }}

      deleteItem={async (id) => {
        try {
          await dispatch(deleteStore(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete store");
        }
      }}

      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteStores(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete stores");
        }
      }}

      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateStore({
              id,
              data: { status: newStatus ? "active" : "inactive" },
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err?.message || "Failed to update status");
        }
      }}
    />
  );
}