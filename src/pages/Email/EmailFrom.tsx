import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { createEmails, updateEmails, getEmailsById } from "@/features/email/emailThunk";
import { toast } from "sonner";

export default function EmailsFormPage() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();
    const { id } = useParams<{ id: string }>();
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    useEffect(() => {
        if (isEditMode && id) {
            dispatch(getEmailsById(id))
                .unwrap()
                .then((data) => setEmail(data.email))
                .catch(() => toast.error("Failed to load email"));
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { email };

        try {
            let result;
            if (isEditMode && id) {
                result = await dispatch(updateEmails({ id, data: payload }));
            } else {
                result = await dispatch(createEmails(payload));
            }

            if (createEmails.fulfilled.match(result) || updateEmails.fulfilled.match(result)) {
                toast.success(isEditMode ? "Email updated successfully!" : "Email created successfully!");
                navigate(`${basePath}/emails`);
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
                <Link to={`${basePath}/emails`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? "Edit Email" : "Add New Email"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditMode ? "Update email address." : "Add a new email address."}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Email Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <Label htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-3">
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            {isEditMode ? "Update Email" : "Create Email"}
                        </Button>
                        <Link to={`${basePath}/emails`} className="flex-1">
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