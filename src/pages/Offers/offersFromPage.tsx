// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store";

// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { ArrowLeft } from "lucide-react";
// import { toast } from "sonner";
// import { useBasePath } from "@/hooks/useBasePath";

// import { createOffer, updateOffer, getOfferById } from "@/features/Offers/offersThunk";
// import { Textarea } from "@/components/ui/textarea";

// // Helper: convert ISO date string → "YYYY-MM-DD" for <input type="date">
// const toDateInput = (val?: string) => {
//     if (!val) return "";
//     return new Date(val).toISOString().split("T")[0];
// };

// export default function OfferForm() {
//     const dispatch = useDispatch<AppDispatch>();
//     const navigate = useNavigate();
//     const { id } = useParams<{ id: string }>();
//     const basePath = useBasePath();

//     const isEditMode = Boolean(id);

//     const [name, setName] = useState("");
//     const [description, setDescription] = useState("");
//     const [status, setStatus] = useState(true);
//     const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
//     const [discountValue, setDiscountValue] = useState("");
//     const [startDate, setStartDate] = useState("");
//     const [endDate, setEndDate] = useState("");

//     useEffect(() => {
//         if (isEditMode && id) {
//             dispatch(getOfferById(id)).then((res: any) => {
//                 if (res.payload) {
//                     const o = res.payload;
//                     setName(o.name || "");
//                     setDescription(o.description || "");
//                     setStatus(o.status === "active");
//                     setDiscountType(o.discount_type || "percentage");
//                     setDiscountValue(o.discount_value?.toString() || "");
//                     setStartDate(toDateInput(o.start_date));
//                     setEndDate(toDateInput(o.end_date));
//                 }
//             });
//         }
//     }, [dispatch, id, isEditMode]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         const payload = {
//             name,
//             description,
//             discount_type: discountType,
//             discount_value: Number(discountValue),
//             start_date: startDate,
//             end_date: endDate,
//             status: status ? "active" : "inactive",
//         };

//         try {
//             let result;
//             if (isEditMode && id) {
//                 result = await dispatch(updateOffer({ id, data: payload }));
//             } else {
//                 result = await dispatch(createOffer(payload));
//             }

//             if (
//                 createOffer.fulfilled.match(result) ||
//                 updateOffer.fulfilled.match(result)
//             ) {
//                 toast.success(
//                     isEditMode ? "Offer updated successfully!" : "Offer created successfully!"
//                 );
//                 navigate(`${basePath}/offer`);
//             } else {
//                 throw new Error("Failed");
//             }
//         } catch {
//             toast.error("Something went wrong");
//         }
//     };

//     return (
//         <div className="p-6 mx-auto">
//             <div className="flex items-center gap-4 mb-6">
//                 <Link to={`${basePath}/offer`}>
//                     <Button variant="ghost" size="icon">
//                         <ArrowLeft className="h-4 w-4" />
//                     </Button>
//                 </Link>
//                 <h1 className="text-3xl font-bold">
//                     {isEditMode ? "Edit Offer" : "Add Offer"}
//                 </h1>
//             </div>

//             <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
//                 <div className="lg:col-span-2 space-y-6">
//                     <Card className="shadow-md border border-gray-200">
//                         <CardHeader>
//                             <CardTitle className="text-lg font-semibold">
//                                 Offer Details
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-5">

//                             <div>
//                                 <Label htmlFor="name">Name *</Label>
//                                 <Input
//                                     id="name"
//                                     value={name}
//                                     onChange={(e) => setName(e.target.value)}
//                                     required
//                                 />
//                             </div>

//                             <div>
//                                 <Label htmlFor="description">Description</Label>
//                                 <Textarea
//                                     id="description"
//                                     value={description}
//                                     onChange={(e) => setDescription(e.target.value)}
//                                     placeholder="Enter offer description..."
//                                 />
//                             </div>

//                             <div>
//                                 <Label htmlFor="discountType">Discount Type</Label>
//                                 <select
//                                     id="discountType"
//                                     value={discountType}
//                                     onChange={(e) =>
//                                         setDiscountType(e.target.value as "percentage" | "fixed")
//                                     }
//                                     className="mt-1 w-full border rounded-md p-2"
//                                 >
//                                     <option value="percentage">Percentage</option>
//                                     <option value="fixed">Fixed</option>
//                                 </select>
//                             </div>

//                             {discountType === "percentage" ? (
//                                 <div>
//                                     <Label htmlFor="percentage">Percentage (%)</Label>
//                                     <Input
//                                         id="percentage"
//                                         type="number"
//                                         value={discountValue}
//                                         onChange={(e) => setDiscountValue(e.target.value)}
//                                         min={1}
//                                         max={100}
//                                     />
//                                 </div>
//                             ) : (
//                                 <div>
//                                     <Label htmlFor="fixedValue">Fixed Value</Label>
//                                     <Input
//                                         id="fixedValue"
//                                         type="number"
//                                         value={discountValue}
//                                         onChange={(e) => setDiscountValue(e.target.value)}
//                                         min={1}
//                                     />
//                                 </div>
//                             )}

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <Label htmlFor="startDate">Start Date</Label>
//                                     <Input
//                                         id="startDate"
//                                         type="datetime-local"
//                                         value={startDate}
//                                         onChange={(e) => setStartDate(e.target.value)}
//                                     />
//                                 </div>
//                                 <div>
//                                     <Label htmlFor="endDate">End Date</Label>
//                                     <Input
//                                         id="endDate"
//                                         type="datetime-local"
//                                         value={endDate}
//                                         onChange={(e) => setEndDate(e.target.value)}
//                                     />
//                                 </div>
//                             </div>

//                         </CardContent>
//                     </Card>
//                 </div>

//                 <div className="space-y-6">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Status</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="flex justify-between items-center">
//                                 <Label>Active</Label>
//                                 <Switch
//                                     checked={status}
//                                     onCheckedChange={(val) => setStatus(val)}
//                                 />
//                             </div>
//                         </CardContent>
//                     </Card>

//                     <div className="flex gap-3">
//                         <Button type="submit" className="flex-1">
//                             {isEditMode ? "Update" : "Create"}
//                         </Button>
//                         <Link to={`${basePath}/offer`} className="flex-1">
//                             <Button variant="outline" className="w-full">
//                                 Cancel
//                             </Button>
//                         </Link>
//                     </div>
//                 </div>
//             </form>
//         </div>
//     );
// }