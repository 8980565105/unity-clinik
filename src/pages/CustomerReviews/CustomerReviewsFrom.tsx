import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useBasePath } from "@/hooks/useBasePath";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    createCustomerReview,
    updateReviews,
    getCustomerReviewById,
} from "@/features/customerReviews/customerReviewsThunk";
import { fetchProducts } from "@/features/products/productsThunk";
import { Switch } from "@/components/ui/switch";

export default function CustomerReviewsForm() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const { products } = useSelector((state: RootState) => state.products);
    const [isApproved, setIsApproved] = useState(true);

    const [productId, setProductId] = useState("");
    const [rating, setRating] = useState<number>(5);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");

    useEffect(() => {
        dispatch(fetchProducts({ limit: 1000 }));
    }, [dispatch]);

    useEffect(() => {
        if (isEditMode && id) {
            dispatch(getCustomerReviewById(id))
                .unwrap()
                .then((data) => {
                    setProductId(data.product_id?._id || data.product_id || "");
                    setRating(data.rating || 5);
                    setTitle(data.title || "");
                    setComment(data.comment || "");
                })
                .catch(() => toast.error("Failed to load review"));
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = { product_id: productId, rating, title, comment, is_approved: isApproved };
        try {
            let result;
            if (isEditMode && id) {
                result = await dispatch(updateReviews({ id, data: payload }));
            } else {
                result = await dispatch(createCustomerReview(payload));
            }

            if (
                createCustomerReview.fulfilled.match(result) ||
                updateReviews.fulfilled.match(result)
            ) {
                toast.success(isEditMode ? "Review updated successfully!" : "Review created successfully!");
                navigate(`${basePath}/customer-reviews`);
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
                <Link to={`${basePath}/customer-reviews`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? "Edit Review" : "Add New Review"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditMode ? "Update customer review." : "Add a new customer review."}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Review Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">

                            <div>
                                <Label htmlFor="productId">
                                    Product <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="productId"
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    disabled={isEditMode} // ✅ disabled in edit mode
                                    required
                                    className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                                        ${isEditMode ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}`}
                                >
                                    <option value="">Select a product</option>
                                    {products?.map((product: any) => (
                                        <option key={product._id} value={product._id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                {isEditMode && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Product cannot be changed in edit mode.
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="rating">
                                    Rating <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="rating"
                                    type="number"
                                    min={1}
                                    max={5}
                                    placeholder="1 - 5"
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="title">
                                    Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Review title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="comment">Comment</Label>
                                <textarea
                                    id="comment"
                                    placeholder="Write review comment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-6 shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">Product:</span> {products?.find((p: any) => p._id === productId)?.name || "-"}</p>
                            <p><span className="font-medium">Rating:</span> {rating} / 5</p>
                            <p><span className="font-medium">Title:</span> {title || "-"}</p>
                        </CardContent>
                    </Card>

                    <Card className="sticky top-6 shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="status">Active</Label>
                               
                                <Switch
                                    id="status"
                                    checked={isApproved}
                                    onCheckedChange={(val) => setIsApproved(val)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            {isEditMode ? "Update Review" : "Create Review"}
                        </Button>
                        <Link to={`${basePath}/customer-reviews`} className="flex-1">
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