import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
    createResults,
    getResultsById,
    updateResults,
} from "@/features/results/resultsThunk";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@radix-ui/react-switch";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";
export default function ResultFrom() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const basePath = useBasePath();
    const [name, setName] = useState("");
    const [afterImg, setAfterImg] = useState<string>("");
    const [beforeImg, setBeforeImg] = useState<string>("");
    const [description, setDescription] = useState("");
    const [age, setAge] = useState("");
    const [gander, setGander] = useState("");
    const [status, setStatus] = useState(true);
    useEffect(() => {
        if (isEditMode && id) {
            dispatch(getResultsById(id)).then((res: any) => {
                if (res.payload) {
                    const result = res.payload;
                    setName(result.name || "");
                    setAfterImg(result.after_image_url || "");
                    setBeforeImg(result.before_image_url || "");
                    setDescription(result.description || "");
                    setGander(result.gander || "");
                    setAge(result.age || "");
                    setStatus(result.status === "active");
                }
            });
        }
    }, [dispatch, id, isEditMode]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return toast.error("Name is required");
        if (!afterImg) return toast.error("After image is required");
        if (!beforeImg) return toast.error("Before image is required");
        const payload = {
            name,
            after_image_url: afterImg,
            before_image_url: beforeImg,
            age,
            gander,
            description,
            status: status ? "active" : "inactive",
        };
        try {
            let result;
            if (isEditMode && id) {
                result = await dispatch(updateResults({ id, data: payload }));
            } else {
                result = await dispatch(createResults(payload));
            }

            if (
                createResults.fulfilled.match(result) ||
                updateResults.fulfilled.match(result)
            ) {
                toast.success(
                    isEditMode
                        ? "Result updated successfully!"
                        : "Result created successfully!"
                );
                navigate(`${basePath}/results`);
            } else {
                toast.error((result.payload as string) || "Something went wrong");
            }
        } catch {
            toast.error("Server Error");
        }
    };
    return (
        <div className="p-6 mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to={`${basePath}/results`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? "Edit Result" : "Add New Result"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditMode
                            ? "Update result details."
                            : "Create a new result entry."}
                    </p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <Label htmlFor="name">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex justify-between items-center mx-3">
                                <div>
                                    <Label>
                                        After Image <span className="text-red-500">*</span>
                                    </Label>
                                    <ImageUpload
                                        value={afterImg}
                                        onChange={(val) => {
                                            if (Array.isArray(val)) {
                                                setAfterImg(val[0] || "");
                                            } else {
                                                setAfterImg(val || "");
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Before Image <span className="text-red-500">*</span>
                                    </Label>
                                    <ImageUpload
                                        value={beforeImg}
                                        onChange={(val) => {
                                            if (Array.isArray(val)) {
                                                setBeforeImg(val[0] || "");
                                            } else {
                                                setBeforeImg(val || "");
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="gander">Gender</Label>
                                    <select
                                        id="gander"
                                        name="gander"
                                        value={gander}
                                        onChange={(e) => setGander(e.target.value)}
                                        className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        value={age}
                                        type="number"
                                        min={1}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="enter age"
                                        className="mt-1"
                                    />
                                </div>

                            </div>
                            <div>
                                <Label>Description</Label>
                                <TiptapEditor
                                    value={description}
                                    onChange={(val) => setDescription(val)}
                                />
                            </div>

                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="status">Active</Label>
                                <Switch
                                    id="status"
                                    checked={status}
                                    onCheckedChange={(val) => setStatus(val)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {isEditMode ? "Update Result" : "Create Result"}
                        </Button>
                        <Link to={`${basePath}/results`} className="flex-1">
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