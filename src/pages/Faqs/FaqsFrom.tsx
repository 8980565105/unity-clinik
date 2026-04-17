import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import { createFaqs, getFaqsById, updateFaqs } from "@/features/faqs/faqsThunk";

export default function FaqsFrom() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const basePath = useBasePath();

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [status, setStatus] = useState(true);
    const [category, setCategory] = useState("");

    useEffect(() => {
        if (isEditMode && id) {
            dispatch(getFaqsById(id)).then((res: any) => {
                if (res.payload) {
                    const faq = res.payload;
                    setQuestion(faq.question || "");
                    setAnswer(faq.answer || "");
                    setCategory(faq.category || "");
                    setStatus(faq.status === "active");
                }
            });
        }
    }, [dispatch, id, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            question,
            answer,
            category,
            status: status ? "active" : "inactive",
        };

        try {
            let result;
            if (isEditMode && id) {
                result = await dispatch(updateFaqs({ id, data: payload }));
            } else {
                result = await dispatch(createFaqs(payload));
            }

            if (createFaqs.fulfilled.match(result) || updateFaqs.fulfilled.match(result)) {
                toast.success(isEditMode ? "FAQ updated successfully!" : "FAQ created successfully!");
                navigate(`${basePath}/faqs`); 
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
                <Link to={`${basePath}/faqs`}> 
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? "Edit FAQ" : "Add New FAQ"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditMode ? "Update FAQ details." : "Create a new FAQ."}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <Label htmlFor="question">Question <span className="text-red-500">*</span></Label>
                                <Input
                                    id="question"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Enter question"
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="answer">Answer</Label>
                                <Input
                                    id="answer"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Enter answer"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Enter category"
                                    className="mt-1"
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
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            {isEditMode ? "Update FAQ" : "Create FAQ"}
                        </Button>
                        <Link to={`${basePath}/faqs`} className="flex-1"> {/* ✅ lowercase */}
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