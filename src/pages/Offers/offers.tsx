// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { GenericTable } from "@/components/ui/adminTable";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store";
// import { useBasePath } from "@/hooks/useBasePath";
// import {
//     bulkDeleteOffers,
//     deleteOffer,
//     fetchOffers,
//     updateOfferStatus,
// } from "@/features/Offers/offersThunk";

// export default function Offers() {
//     const dispatch = useDispatch<AppDispatch>();
//     const basePath = useBasePath();

//     const columns = [
//         { key: "name", label: "Name", width: "w-48" },
//         {
//             key: "discount_type",
//             label: "Type",
//             render: (item: any) =>
//                 item.discount_type === "percentage" ? "Percentage" : "Fixed",
//         },
//         {
//             key: "discount_value",
//             label: "Discount",
//             render: (item: any) =>
//                 item.discount_type === "percentage"
//                     ? `${item.discount_value}%`
//                     : `₹${item.discount_value}`,
//         },
//         {
//             key: "start_date",
//             label: "Start Date",
//             render: (item: any) =>
//                 item.start_date
//                     ? new Date(item.start_date).toLocaleDateString()
//                     : "-",
//         },
//         {
//             key: "end_date",
//             label: "End Date",
//             render: (item: any) =>
//                 item.end_date ? new Date(item.end_date).toLocaleDateString() : "-",
//         },
//         {
//             key: "createdAt",
//             label: "Created At",
//             render: (item: any) =>
//                 item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
//         },
//     ];

//     return (
//         <GenericTable
//             title="Offer"
//             columns={columns}
//             rowKey="_id"
//             searchEnabled
//             statusToggleEnabled
//             filters={[
//                 { label: "Active", value: "active" },
//                 { label: "Inactive", value: "inactive" },
//             ]}
//             fetchData={async ({ page, limit, search, status }) => {
//                 const res = await dispatch(
//                     fetchOffers({ page, limit, search, status })
//                 ).unwrap();
//                 return { data: res.offers, total: res.total };
//             }}
//             deleteItem={async (id) => {
//                 await dispatch(deleteOffer(id)).unwrap();
//             }}
//             bulkDeleteItems={async (ids) => {
//                 await dispatch(bulkDeleteOffers(ids)).unwrap();
//             }}
//             onStatusToggle={async (id, newStatus) => {
//                 await dispatch(
//                     updateOfferStatus({ id, status: newStatus ? "active" : "inactive" })
//                 ).unwrap();
//             }}
//             headerActions={
//                 <Link to={`${basePath}/offer/add`}>
//                     <Button className="flex items-center gap-2">
//                         <Plus className="h-4 w-4" /> Add Offer
//                     </Button>
//                 </Link>
//             }
//         />
//     );
// }
