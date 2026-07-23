
// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { ArrowLeft, CheckCircle2 } from "lucide-react";
// import { toast } from "sonner";
// import { useBasePath } from "@/hooks/useBasePath";
// import {
//     getOrderById,
//     updateOrderShippingDetails,
//     updateOrderStatus,
//     pushOrderToIthink,
// } from "@/features/orders/ordersThunk";
// import { clearSelectedOrder } from "@/features/orders/ordersSlice";

// export default function OrderEditPage() {
//     const dispatch = useDispatch<AppDispatch>();
//     const basePath = useBasePath();
//     const navigate = useNavigate();
//     const { id } = useParams<{ id: string }>();

//     const [shippingAddr, setShippingAddr] = useState({
//         firstName: "", lastName: "", address: "", state: "", city: "", pincode: "", phone: "",
//     });

//     const [dims, setDims] = useState({
//         shipment_weight: "",
//         shipment_length: "",
//         shipment_width: "",
//         shipment_height: "",
//     });

//     const [selectedLogistics, setSelectedLogistics] = useState(""); // ⭐ radio selection
//     const [savingDetails, setSavingDetails] = useState(false);
//     const [pushing, setPushing] = useState(false);

//     const {
//         selectedOrder,
//         loading,
//         actionLoading,
//     } = useSelector((state: RootState) => state.orders);

//     useEffect(() => {
//         if (id) dispatch(getOrderById(id));
//         return () => {
//             dispatch(clearSelectedOrder());
//         };
//     }, [dispatch, id]);

//     const order = (selectedOrder as any)?.order || selectedOrder;
//     const items = (selectedOrder as any)?.items || order?.items || [];

//     useEffect(() => {
//         if (order) {
//             setDims({
//                 shipment_weight: order.shipment_weight || "",
//                 shipment_length: order.shipment_length || "",
//                 shipment_width: order.shipment_width || "",
//                 shipment_height: order.shipment_height || "",
//             });
//         }
//     }, [order]);

//     useEffect(() => {
//         if (order?.shippingAddress) setShippingAddr(order.shippingAddress);
//     }, [order]);



//     const handleSaveShippingDetails = async () => {
//         if (!order) return;
//         setSavingDetails(true);
//         try {
//             const result = await dispatch(
//                 updateOrderShippingDetails({
//                     id: order._id,
//                     shippingAddress: shippingAddr,
//                     ...dims,
//                 } as any),
//             );
//             if (updateOrderShippingDetails.fulfilled.match(result)) {
//                 toast.success("Shipping details saved!");
//             } else {
//                 toast.error((result.payload as string) || "Failed to save details");
//             }
//         } catch {
//             toast.error("Server Error");
//         } finally {
//             setSavingDetails(false);
//         }
//     };

//     if (loading || !order) {
//         return <div className="p-10 text-center text-gray-500">Loading order...</div>;
//     }

//     const alreadyPushed = !!order.courier?.awb_number || !!order.ithink_pushed;

//     return (
//         <div className="p-6 mx-auto">
//             <div className="flex items-center gap-4 mb-6">
//                 <Link to={`${basePath}/orders`}>
//                     <Button variant="ghost" size="icon">
//                         <ArrowLeft className="h-4 w-4" />
//                     </Button>
//                 </Link>
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900">
//                         Edit Order — {order.order_number}
//                     </h1>
//                     <p className="text-gray-500 mt-1">Update shipment details & select courier.</p>
//                 </div>
//             </div>

//             <div className="grid lg:grid-cols-3 gap-6">
//                 <div className="lg:col-span-2 space-y-6">
//                     <Card className="shadow-md border border-gray-200">
//                         <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
//                         <CardContent>
//                             <table className="w-full text-sm">
//                                 <thead>
//                                     <tr className="text-xs text-gray-500 border-b">
//                                         <th className="text-left py-2">Product</th>
//                                         <th className="text-left py-2">SKU</th>
//                                         <th className="text-center py-2">Qty</th>
//                                         <th className="text-right py-2">Price</th>
//                                         <th className="text-right py-2">Subtotal</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y">
//                                     {items.map((item: any) => (
//                                         <tr key={item._id}>
//                                             <td className="py-2">{item.product_id?.name || "Product"}</td>
//                                             <td className="py-2">{item.variant_id?.sku || "-"}</td>
//                                             <td className="py-2 text-center">{item.quantity}</td>
//                                             <td className="py-2 text-right">₹{item.price_at_order?.toFixed(2)}</td>
//                                             <td className="py-2 text-right font-semibold">
//                                                 ₹{(item.price_at_order * item.quantity)?.toFixed(2)}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </CardContent>
//                     </Card>

//                     <Card className="shadow-md border border-gray-200">
//                         <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
//                         <CardContent className="grid grid-cols-2 gap-3 space-y-3">
//                             <div className="flex flex-col space-y-2">
//                                 <Label>First Name</Label>
//                                 <input placeholder="First Name" value={shippingAddr.firstName}
//                                     onChange={(e) => setShippingAddr({ ...shippingAddr, firstName: e.target.value })}
//                                     className="border rounded px-3 py-2 text-sm" />
//                             </div>
//                             <div className="flex flex-col space-y-2">
//                                 <Label>Last Name</Label>
//                                 <input placeholder="Last Name" value={shippingAddr.lastName}
//                                     onChange={(e) => setShippingAddr({ ...shippingAddr, lastName: e.target.value })}
//                                     className="border rounded px-3 py-2 text-sm" />
//                             </div>
//                             <div className="flex flex-col space-y-2">
//                                 <Label>Address</Label>
//                                 <input placeholder="Address" value={shippingAddr.address}
//                                     onChange={(e) => setShippingAddr({ ...shippingAddr, address: e.target.value })}
//                                     className="border rounded px-3 py-2 text-sm col-span-2" />
//                             </div>
//                             <div className="flex flex-col space-y-2">
//                                 <Label>City</Label>
//                                 <input placeholder="City" value={shippingAddr.city}
//                                     onChange={(e) => setShippingAddr({ ...shippingAddr, city: e.target.value })}
//                                     className="border rounded px-3 py-2 text-sm" />
//                             </div>
//                             <div className="flex flex-col space-y-2">
//                                 <Label>State</Label>
//                                 <input placeholder="State" value={shippingAddr.state}
//                                     onChange={(e) => setShippingAddr({ ...shippingAddr, state: e.target.value })}
//                                     className="border rounded px-3 py-2 text-sm" />
//                             </div>
//                             <div className="flex flex-col space-y-2">
//                                 <Label>Pincode</Label>
//                                 <input placeholder="Pincode" value={shippingAddr.pincode}
//                                     onChange={(e) => setShippingAddr({ ...shippingAddr, pincode: e.target.value })}
//                                     className="border rounded px-3 py-2 text-sm" />
//                             </div>
//                             <div className="flex flex-col space-y-2">
//                                 <Label>Phone</Label>
//                                 <input placeholder="Phone" value={shippingAddr.phone}
//                                     onChange={(e) => setShippingAddr({ ...shippingAddr, phone: e.target.value })}
//                                     className="border rounded px-3 py-2 text-sm" />
//                             </div>
//                         </CardContent>
//                     </Card>

//                     <Card className="shadow-md border border-gray-200">
//                         <CardHeader><CardTitle>Shipment Dimensions</CardTitle></CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <Label>Weight (kg) *</Label>
//                                     <input
//                                         type="number"
//                                         placeholder="Weight (kg)"
//                                         value={dims.shipment_weight}
//                                         onChange={(e) => setDims({ ...dims, shipment_weight: e.target.value })}
//                                         className="border rounded px-2 py-1 text-sm w-full mt-1"
//                                     />
//                                 </div>
//                                 <div>
//                                     <Label>Length (cms) *</Label>
//                                     <input
//                                         type="number"
//                                         placeholder="Length (cm)"
//                                         value={dims.shipment_length}
//                                         onChange={(e) => setDims({ ...dims, shipment_length: e.target.value })}
//                                         className="border rounded px-2 py-1 text-sm w-full mt-1"
//                                     />
//                                 </div>
//                                 <div>
//                                     <Label>Width (cms) *</Label>
//                                     <input
//                                         type="number"
//                                         placeholder="Width (cm)"
//                                         value={dims.shipment_width}
//                                         onChange={(e) => setDims({ ...dims, shipment_width: e.target.value })}
//                                         className="border rounded px-2 py-1 text-sm w-full mt-1"
//                                     />
//                                 </div>
//                                 <div>
//                                     <Label>Height (cms) *</Label>
//                                     <input
//                                         type="number"
//                                         placeholder="Height (cm)"
//                                         value={dims.shipment_height}
//                                         onChange={(e) => setDims({ ...dims, shipment_height: e.target.value })}
//                                         className="border rounded px-2 py-1 text-sm w-full mt-1"
//                                     />
//                                 </div>
//                             </div>
//                         </CardContent>
//                     </Card>

//                     {/* {!alreadyPushed && (
//                         <Card className="shadow-md border border-gray-200">
//                             <CardHeader><CardTitle>Select Courier Partner</CardTitle></CardHeader>
//                             <CardContent>
//                                 {ratesLoading ? (
//                                     <p className="text-sm text-muted-foreground">Loading courier rates...</p>
//                                 ) : ratesError ? (
//                                     <p className="text-sm text-red-500">{ratesError}</p>
//                                 ) : courierRates.length > 0 ? (
//                                     <ul className="space-y-2">
//                                         {courierRates.map((c) => (
//                                             <li
//                                                 key={c.logistic_name}
//                                                 onClick={() => setSelectedLogistics(c.logistic_name)}
//                                                 className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${selectedLogistics === c.logistic_name
//                                                         ? "border-blue-500 bg-blue-50"
//                                                         : "border-gray-200 hover:bg-gray-50"
//                                                     }`}
//                                             >
//                                                 <div className="flex items-center gap-3">
//                                                     <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold">
//                                                         {c.logistic_name.charAt(0)}
//                                                     </div>
//                                                     <div>
//                                                         <p className="font-medium text-sm">{c.logistic_name}</p>
//                                                         {c.delivery_tat && (
//                                                             <p className="text-xs text-muted-foreground">{c.delivery_tat} day(s)</p>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex items-center gap-3">
//                                                     <span className="text-sm font-semibold">₹{c.rate}</span>
//                                                     <input
//                                                         type="radio"
//                                                         name="courier_partner"
//                                                         checked={selectedLogistics === c.logistic_name}
//                                                         onChange={() => setSelectedLogistics(c.logistic_name)}
//                                                         className="w-4 h-4 accent-blue-600 cursor-pointer"
//                                                     />
//                                                 </div>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 ) : (
//                                     <p className="text-sm text-red-500">
//                                         Fill weight, length, width, height & pincode, then Save Changes to see courier rates.
//                                     </p>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     )} */}

//                     {alreadyPushed && (
//                         <Card className="shadow-md border border-green-200 bg-green-50">
//                             <CardContent className="py-4 flex items-center gap-2 text-green-700 text-sm">
//                                 <CheckCircle2 className="h-4 w-4" />
//                                 Already pushed to iThink — Partner: <strong>{order.courier?.name}</strong>, AWB: <strong>{order.courier?.awb_number}</strong>
//                             </CardContent>
//                         </Card>
//                     )}
//                 </div>

//                 <div className="space-y-6">
//                     <Card className="sticky top-5 shadow-md border border-gray-200">
//                         <CardHeader>
//                             <CardTitle className="text-lg font-semibold">Actions</CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-3">
//                             <Button
//                                 type="button"
//                                 onClick={handleSaveShippingDetails}
//                                 disabled={savingDetails}
//                                 className="w-full bg-blue-600 hover:bg-blue-700"
//                             >
//                                 {savingDetails ? "Saving..." : "Save Changes"}
//                             </Button>

//                             {/* {!alreadyPushed && (
//                                 <Button
//                                     type="button"
//                                     onClick={handlePushToIthink}
//                                     disabled={pushing || !selectedLogistics}
//                                     className="w-full bg-purple-600 hover:bg-purple-700"
//                                 >
//                                     {pushing ? "Pushing..." : `Ship with ${selectedLogistics || "..."}`}
//                                 </Button>
//                             )} */}

//                             <Link to={`${basePath}/orders`} className="block">
//                                 <Button type="button" variant="outline" className="w-full">
//                                     Cancel
//                                 </Button>
//                             </Link>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </div>
//         </div>
//     );
// }