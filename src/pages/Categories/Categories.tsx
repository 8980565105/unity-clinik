// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { GenericTable } from "@/components/ui/adminTable";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store";
// import { useBasePath } from "@/hooks/useBasePath";
// import {
//   bulkDeleteCategories,
//   deleteCategory,
//   fetchCategories,
//   updateCategoryStatus,
// } from "@/features/categories/categoriesThunk";

// export default function CategoriesPage() {
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
//           <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
//             —
//           </div>
//         ),
//       width: "w-20",
//     },
//     { key: "name", label: "Name", width: "w-48" },
//     // {
//     //   key: "parent_id",
//     //   label: "Parent",
//     //   render: (item: any) => item.parent_id?.name || "-",
//     //   width: "w-48",
//     // },
//   ];

//   return (
//     <GenericTable
//       title="Categories"
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
//             fetchCategories({ page, limit, search, status })
//           ).unwrap();
//           return { data: res.categories, total: res.total };
//         } catch (err: any) {
//           throw new Error(err || "Failed to load categories");
//         }
//       }}
//       deleteItem={async (id) => {
//         try {
//           await dispatch(deleteCategory(id)).unwrap();
//         } catch (err: any) {
//           throw new Error(err || "Failed to delete category");
//         }
//       }}
//       bulkDeleteItems={async (ids) => {
//         try {
//           await dispatch(bulkDeleteCategories(ids)).unwrap();
//         } catch (err: any) {
//           throw new Error(err || "Failed to delete categories");
//         }
//       }}
//       onStatusToggle={async (id, newStatus) => {
//         try {
//           await dispatch(
//             updateCategoryStatus({
//               id,
//               status: newStatus ? "active" : "inactive",
//             })
//           ).unwrap();
//         } catch (err: any) {
//           throw new Error(err || "Failed to update status");
//         }
//       }}
//       headerActions={
//         <Link to={`${basePath}/categories/add`}>
//           <Button className="flex items-center gap-2">
//             <Plus className="h-4 w-4" /> Add Category
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import { useEffect, useState } from "react";
import {
  bulkDeleteCategories,
  deleteCategory,
  fetchCategories,
  updateCategoryStatus,
} from "@/features/categories/categoriesThunk";
import { fetchUsers } from "@/features/users/usersThunk";

export default function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const [creatorsMap, setCreatorsMap] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setLoaded(true);
      return;
    }

    dispatch(fetchUsers({ limit: 1000 }))
      .unwrap()
      .then((payload: any) => {
        console.log("USERS PAYLOAD:", payload);
        const userList: any[] =
          payload?.users ??
          payload?.data?.users ??
          (Array.isArray(payload) ? payload : []);

        const map: Record<string, string> = {};
        userList.forEach((u: any) => {
          const id = u._id;

          const name =
            u.name ||
            `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
            u.email ||
            "Unknown";
          if (id) map[id] = name;
        });

        console.log("CREATORS MAP:", map);
        setCreatorsMap(map);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [dispatch]);

  const getCreatorName = (createdById?: string) => {
    if (!createdById) return "-";
    return creatorsMap[createdById] || "-";
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
      width: "w-20",
    },
    { key: "name", label: "Name", width: "w-48" },
    // {
    //   key: "createdBy",
    //   label: "Created By",
    //   render: (item: any) => (
    //     <span className="text-sm text-gray-700">
    //       {getCreatorName(item.createdBy)}
    //     </span>
    //   ),
    //   width: "w-48",
    // },
    // ✅ Sirf admin ne j "Created By" column dikhay
    ...(isAdmin
      ? [
        {
          key: "createdBy",
          label: "Created By",
          render: (item: any) => (
            <span className="text-sm text-gray-700">
              {getCreatorName(item.createdBy)}
            </span>
          ),
          width: "w-48",
        },
      ]
      : []),
  ];

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <GenericTable
      title="Categories"
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
            fetchCategories({ page, limit, search, status })
          ).unwrap();
          return { data: res.categories, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load categories");
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
      headerActions={
        <Link to={`${basePath}/categories/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </Link>
      }
    />
  );
}