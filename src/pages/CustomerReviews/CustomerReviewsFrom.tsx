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
import { fetchUsers } from "@/features/users/usersThunk";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/ImageUpload";

const toLocalDatetimeValue = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function CustomerReviewsForm() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const { products } = useSelector((state: RootState) => state.products);
    const { users } = useSelector((state: RootState) => state.users);

    const [isApproved, setIsApproved] = useState(true);
    const [productId, setProductId] = useState("");
    const [userId, setUserId] = useState("");
    const [rating, setRating] = useState<number>(5);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [beforeImage, setBeforeImage] = useState("");
    const [afterImage, setAfterImage] = useState("");
    const [reviewDate, setReviewDate] = useState(toLocalDatetimeValue(new Date()));

    useEffect(() => {
        dispatch(fetchProducts({ limit: 1000 }));
        dispatch(fetchUsers({ limit: 1000 }));
    }, [dispatch]);

    useEffect(() => {
        if (isEditMode && id) {
            dispatch(getCustomerReviewById(id))
                .unwrap()
                .then((data) => {
                    setProductId(data.product_id?._id || data.product_id || "");
                    setUserId(data.user_id?._id || data.user_id || "");
                    setRating(data.rating || 5);
                    setTitle(data.title || "");
                    setComment(data.comment || "");
                    setIsApproved(data.is_approved ?? true);
                    setBeforeImage(data.beforeImage || "");
                    setAfterImage(data.afterImage || "");
                    if (data.createdAt) {
                        setReviewDate(toLocalDatetimeValue(new Date(data.createdAt)));
                    }
                })
                .catch(() => toast.error("Failed to load review"));
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!productId) { toast.error("Please select a product"); return; }
        if (!userId) { toast.error("Please select a user"); return; }
        if (!title.trim()) { toast.error("Title is required"); return; }

        const isoDate = new Date(reviewDate).toISOString();

        const payload = {
            product_id: productId,
            user_id: userId,
            rating,
            title: title.trim(),
            comment: comment.trim(),
            is_approved: isApproved,
            beforeImage,
            afterImage,
            createdAt: isoDate,
        };

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
                toast.success(
                    isEditMode ? "Review updated successfully!" : "Review created successfully!"
                );
                navigate(`${basePath}/customer-reviews`);
            } else {
                toast.error((result.payload as string) || "Something went wrong");
            }
        } catch {
            toast.error("Server Error");
        }
    };

    const selectedProduct = products?.find((p: any) => p._id === productId);
    const selectedUser = users?.find((u: any) => u._id === userId);

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
                                    required
                                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                                       "
                                >
                                    <option value="">Select a product</option>
                                    {products?.map((product: any) => (
                                        <option key={product._id} value={product._id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="userId">
                                    User <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="userId"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    required
                                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

                                >
                                    <option value="">Select a user</option>
                                    {users?.map((user: any) => (
                                        <option key={user._id} value={user._id}>
                                            {user.name}{user.email ? ` (${user.email})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="rating">
                                    Rating <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="rating"
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    required
                                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value={5}>5 — Excellent</option>
                                    <option value={4}>4 — Good</option>
                                    <option value={3}>3 — Average</option>
                                    <option value={2}>2 — Poor</option>
                                    <option value={1}>1 — Terrible</option>
                                </select>
                                <div className="flex gap-1 mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="text-2xl transition-transform hover:scale-110"
                                        >
                                            <span className={star <= rating ? "text-yellow-400" : "text-gray-300"}>
                                                ★
                                            </span>
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-500 self-center">{rating} / 5</span>
                                </div>
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
                                <Label htmlFor="comment">Description</Label>
                                <textarea
                                    id="comment"
                                    placeholder="Write review description..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div>
                                <Label htmlFor="date">Date & Time</Label>
                                <input
                                    id="date"
                                    type="datetime-local"
                                    value={reviewDate}
                                    onChange={(e) => setReviewDate(e.target.value)}
                                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>
                            <div className="flex gap-3">
                                <div>
                                    <Label>befor Image</Label>
                                    <ImageUpload
                                        value={beforeImage}
                                        onChange={(val: any) => {
                                            const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";
                                            setBeforeImage(image);
                                        }}
                                        multiple={false} />
                                </div>
                                <div>
                                    <Label>after Image</Label>
                                    <ImageUpload
                                        value={afterImage}
                                        onChange={(val: any) => {
                                            const image = typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";
                                            setAfterImage(image);
                                        }}
                                        multiple={false} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">

                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">Product:</span> {selectedProduct?.name || "-"}</p>
                            <p><span className="font-medium">User:</span> {selectedUser?.name || "-"}</p>
                            <p><span className="font-medium">Rating:</span> {rating} / 5</p>
                            <p><span className="font-medium">Title:</span> {title || "-"}</p>
                            <p>
                                <span className="font-medium">Date:</span>{" "}
                                {reviewDate ? new Date(reviewDate).toLocaleString("en-GB") : "-"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="status">
                                        {isApproved ? "Approved" : "Pending"}
                                    </Label>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {isApproved
                                            ? "Review is visible on the product page."
                                            : "Review is hidden until approved."}
                                    </p>
                                </div>
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