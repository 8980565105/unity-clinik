
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { GenericTable } from "@/components/ui/adminTable";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store";
// import { useBasePath } from "@/hooks/useBasePath";
// import {
//     bulkDeleteSlides,
//     deleteSlide,
//     fetchSlides,
//     updateSlideStatus,
// } from "@/features/slider/sliderThunk";

// export default function SliderPage() {
//     const dispatch = useDispatch<AppDispatch>();
//     const basePath = useBasePath();

//     const columns = [
//         { key: "title", label: "Title", width: "w-48" },

//         { key: "order", label: "Order", width: "w-20" },
//     ];

//     return (
//         <GenericTable
//             title="Sliders"
//             columns={columns}
//             rowKey="_id"
//             searchEnabled
//             statusToggleEnabled
//             filters={[
//                 { label: "Active", value: "active" },
//                 { label: "Inactive", value: "inactive" },
//             ]}


//             fetchData={async ({ page, limit, search, status }) => {
//                 try {
//                     const res = await dispatch(
//                         fetchSlides({ page, limit, search, status })
//                     ).unwrap();
//                     return { data: res.slides, total: res.total };
//                 } catch (err: any) {
//                     throw new Error(err || "Failed to load slides");
//                 }
//             }}
//             deleteItem={async (id) => {
//                 try {
//                     await dispatch(deleteSlide(id)).unwrap();
//                 } catch (err: any) {
//                     throw new Error(err || "Failed to delete slide");
//                 }
//             }}
//             bulkDeleteItems={async (ids) => {
//                 try {
//                     await dispatch(bulkDeleteSlides(ids)).unwrap();
//                 } catch (err: any) {
//                     throw new Error(err || "Failed to delete slides");
//                 }
//             }}
//             onStatusToggle={async (id, newStatus) => {
//                 try {
//                     await dispatch(
//                         updateSlideStatus({
//                             id,
//                             status: newStatus ? "active" : "inactive",
//                         })
//                     ).unwrap();
//                 } catch (err: any) {
//                     throw new Error(err || "Failed to update status");
//                 }
//             }}
//             headerActions={
//                 <Link to={`${basePath}/slider/add`}>
//                     <Button className="flex items-center gap-2">
//                         <Plus className="h-4 w-4" /> Add Slide
//                     </Button>
//                 </Link>
//             }
//         />
//     );
// }
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
    bulkDeleteSlides,
    deleteSlide,
    fetchSlides,
    updateSlideStatus,
} from "@/features/slider/sliderThunk";

export default function SliderPage() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();

    const columns = [
        { key: "section", label: "Section", width: "w-48" },
     
    ];

    return (
        <GenericTable
            title="Slider"
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
                        fetchSlides({ page, limit, search, status })
                    ).unwrap();
                    return { data: res.slides ?? [], total: res.total ?? 0 };
                } catch (err: any) {
                    throw new Error(err || "Failed to load slides");
                }
            }}
            deleteItem={async (id) => {
                try {
                    await dispatch(deleteSlide(id)).unwrap();
                } catch (err: any) {
                    throw new Error(err || "Failed to delete slide");
                }
            }}
            bulkDeleteItems={async (ids) => {
                try {
                    await dispatch(bulkDeleteSlides(ids)).unwrap();
                } catch (err: any) {
                    throw new Error(err || "Failed to delete slides");
                }
            }}
            onStatusToggle={async (id, newStatus) => {
                try {
                    await dispatch(
                        updateSlideStatus({
                            id,
                            status: newStatus ? "active" : "inactive",
                        })
                    ).unwrap();
                } catch (err: any) {
                    throw new Error(err || "Failed to update status");
                }
            }}
            headerActions={
                <Link to={`${basePath}/slider/add`}>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Slide
                    </Button>
                </Link>
            }
        />
    );
}