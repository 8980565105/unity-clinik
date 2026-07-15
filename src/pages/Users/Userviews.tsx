import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Mail,
    Phone,
    ShieldCheck,
    Smartphone,
    MapPin,
    ShoppingBag,
    Wallet,
    Heart,
    ShoppingCart,
    TrendingUp,
    AlertTriangle,
    Activity,
    Globe,
    Monitor,
    Calendar,
    Clock,
    ColumnsIcon,
} from "lucide-react";
import { useBasePath } from "@/hooks/useBasePath";
import { AppDispatch } from "@/store";
import { getUserTracking } from "@/features/users/usersThunk";
import { toast } from "sonner";

const Card = ({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <div className="bg-white border rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
            {icon}
            <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
        </div>
        {children}
    </div>
);

const Stat = ({
    label,
    value,
    valueClass = "",
}: {
    label: string;
    value: React.ReactNode;
    valueClass?: string;
}) => (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100">
        <span className="text-[13px] text-gray-500 font-semibold">{label}</span>
        <span className={`text-[13px] font-semibold text-gray-900 ${valueClass}`}>
            {value ?? "—"}
        </span>
    </div>
);

const Badge = ({
    text,
    color = "gray",
}: {
    text: string;
    color?: "gray" | "green" | "red" | "blue" | "purple" | "amber";
}) => {
    const colors: Record<string, string> = {
        gray: "bg-gray-100 text-gray-600",
        green: "bg-green-100 text-green-700",
        red: "bg-red-100 text-red-700",
        blue: "bg-blue-100 text-blue-700",
        purple: "bg-purple-100 text-purple-700",
        amber: "bg-amber-100 text-amber-700",
    };
    return (
        <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors[color]}`}
        >
            {text}
        </span>
    );
};

const NotTracked = () => (
    <p className="text-[12px] text-gray-400 italic">
        Not tracked yet — backend field pending
    </p>
);

const tagColorMap: Record<string, any> = {
    "New User": "blue",
    "No Purchase Yet": "gray",
    "First-time Buyer": "purple",
    "Repeat Customer": "green",
    "High Spender": "amber",
    "At Risk": "red",
    Inactive: "red",
    "Abandoned Cart": "amber",
    "Coupon User": "purple",
};

export default function UserViews() {
    const { id } = useParams();
    const navigate = useNavigate();
    const basePath = useBasePath();
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await dispatch(getUserTracking(id as string)).unwrap();
                setData(res);
            } catch (err: any) {
                toast.error(err || "Failed to load user tracking");
                navigate(`${basePath}/users`);
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    if (loading)
        return <div className="p-10 text-center text-gray-500">Loading...</div>;
    if (!data)
        return <div className="p-10 text-center text-gray-500">User not found</div>;
    const {
        user,
        purchaseAnalytics,
        couponWallet,
        wishlist,
        cart,
        tags,
        deviceTracking,
        shoppingBehavior,
        engagement,
        pageVisitHistory,
    } = data;

    const lastDevice = deviceTracking?.lastDevice;
    const loginHistory = deviceTracking?.loginHistory || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link to={`${basePath}/users`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        User Tracking Dashboard
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Complete activity, behavior & risk profile
                    </p>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold text-xl">
                            {user.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                            {user.email && (
                                <span className="flex items-center gap-1">
                                    <Mail size={13} /> {user.email}
                                </span>
                            )}
                            {user.mobile_number && (
                                <span className="flex items-center gap-1">
                                    <Phone size={13} /> {user.mobile_number}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge
                                text={user.is_active ? "Active" : "Inactive"}
                                color={user.is_active ? "green" : "red"}
                            />
                            <Badge text={user.authProvider} color="blue" />
                            {tags.map((t: string, i: number) => (
                                <Badge key={i} text={t} color={tagColorMap[t] || "gray"} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Card title="Account Tracking" icon={<ShieldCheck size={17} className="text-blue-600" />}>
                    <Stat
                        label="Registration Date"
                        value={new Date(user.createdAt).toLocaleDateString("en-IN")}
                    />

                    <Stat
                        label="Registration type"
                        value={user.authProvider}
                    />

                    <Stat
                        label="Last Login"
                        value={
                            user.lastLogin
                                ? new Date(user.lastLogin).toLocaleString("en-IN")
                                : "—"
                        }
                    />
                    <Stat label="Login Count" value={user.loginCount ?? "—"} />
                    <Stat
                        label="Account Status"
                        value={user.is_active ? "Active" : "Inactive"}
                        valueClass={user.is_active ? "text-green-600" : "text-red-600"}
                    />
                </Card>

                <Card title="Device & Location" icon={<Smartphone size={17} className="text-indigo-600" />}>
                    {lastDevice ? (
                        <>
                            <Stat
                                label="Device Type"
                                value={lastDevice.type}
                            />
                            <Stat label="Browser" value={lastDevice.browser} />
                            <Stat label="Operating System" value={lastDevice.os} />
                            <Stat label="IP Address" value={lastDevice.ip} />


                            <Stat
                                label="Approx. Location"
                                value={
                                    lastDevice.city
                                        ? `${lastDevice.city}, ${lastDevice.state || ""}${lastDevice.country ? `, ${lastDevice.country}` : ""}`
                                        : "Unknown"
                                }
                            />
                            <Stat label="Pincode" value={lastDevice.zip_code} />
                            <Stat
                                label="Coordinates"
                                value={
                                    lastDevice.latitude != null && lastDevice.longitude != null
                                        ? `${lastDevice.latitude}, ${lastDevice.longitude}`
                                        : "—"
                                }
                            />
                            {lastDevice.latitude != null && lastDevice.longitude != null && (

                                <a href={`https://www.google.com/maps?q=${lastDevice.latitude},${lastDevice.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[12px] text-blue-600 underline"
                                >
                                    View on Google Maps
                                </a>
                            )}
                            {loginHistory.length > 1 && (
                                <div className="pt-3">
                                    <p className="text-[13px] text-gray-500 mb-1 flex items-center gap-1">
                                        <Globe size={12} /> Recent Login History
                                    </p>
                                    <ul className="text-[12px] text-gray-700 space-y-1.5 max-h-40 overflow-y-auto">
                                        {loginHistory.slice(0, 5).map((h: any, i: number) => (
                                            <li
                                                key={i}
                                                className="flex items-center justify-between border-b border-gray-50 pb-1 last:border-0"
                                            >
                                                <span className="flex items-center gap-1">
                                                    <Monitor size={11} className="text-gray-400" />
                                                    {h.type} · {h.browser} · {h.os}
                                                </span>

                                                <span className="text-gray-400">
                                                    {new Date(h.loggedInAt).toLocaleString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <NotTracked />
                    )}
                </Card>

                <Card title="Purchase Analytics" icon={<ShoppingBag size={17} className="text-green-600" />}>
                    <Stat label="Total Orders" value={purchaseAnalytics.totalOrders} />
                    <Stat
                        label="Total Spending"
                        value={`₹${Number(purchaseAnalytics.totalSpending).toLocaleString("en-IN")}`}
                    />
                    <Stat
                        label="Average Order Value"
                        value={`₹${Math.round(purchaseAnalytics.avgOrderValue).toLocaleString("en-IN")}`}
                    />
                    <Stat
                        label="Last Order Date"
                        value={
                            purchaseAnalytics?.lastOrderDate
                                ? (
                                    <span className="text-gray-400">
                                        {new Date(purchaseAnalytics.lastOrderDate).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: true,
                                        })}
                                    </span>
                                ) : (
                                    "—"
                                )
                        }
                    />


                    <Stat label="Preferred Payment" value={purchaseAnalytics.preferredPaymentMethod} />
                    <Stat
                        label="Cancelled Orders"
                        value={purchaseAnalytics.cancelledOrders}
                        valueClass="text-red-600"
                    />
                    <Stat label="Returned Orders" value={purchaseAnalytics.returnedOrders} />
                    <Stat label="Refunded Orders" value={purchaseAnalytics.refundedOrders} />
                </Card>

                <Card title="Cart & Wishlist Activity" icon={<Heart size={17} className="text-pink-600" />}>

                    <Stat label="Cart Items (current)" value={cart?.length ?? 0} />
                    {cart?.length > 0 && (
                        <div className="pt-2">
                            <p className="text-[13px] text-gray-500 mb-1 font-semibold">Cart Items history</p>
                            <ul className="text-[12px] text-gray-700 space-y-1">
                                {cart.slice(0, 5).map((c: any, i: number) => (
                                    <li key={i}>
                                        • {c.product_id?.name || "Product"} × {c.quantity || 1}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <Stat label="Wishlist Items" value={wishlist?.length ?? 0} />
                    {wishlist?.length > 0 && (
                        <div className="pt-2">
                            <p className="text-[13px] text-gray-500 mb-1 font-semibold">wishlist Items history</p>
                            <ul className="text-[12px] text-gray-700 space-y-1">
                                {wishlist.slice(0, 5).map((c: any, i: number) => (
                                    <li key={i}>
                                        • {c.product_id?.name || "Product"}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Card>


                <Card title="Page Visit History" icon={<Globe size={17} className="text-red-400" />}>
                    {pageVisitHistory ? (
                        <>
                            <Stat label="Total Page Views" value={pageVisitHistory.totalPageViews} />
                            <Stat label="Unique Pages Visited" value={pageVisitHistory.uniquePagesCount} />
                            <Stat
                                label="Most Visited Page"
                                value={pageVisitHistory.mostVisitedPage || "—"}
                            />
                            <Stat
                                label="Last Visited Page"
                                value={
                                    pageVisitHistory.lastVisitedPage
                                        ? pageVisitHistory.lastVisitedPage.page_title
                                        : "—"
                                }
                            />
                            <Stat
                                label="Last Visit Time"
                                value={
                                    pageVisitHistory.lastVisitedPage?.visited_at
                                        ? new Date(
                                            pageVisitHistory.lastVisitedPage.visited_at,
                                        ).toLocaleString("en-IN")
                                        : "—"
                                }
                            />

                            {pageVisitHistory.recentPageHistory?.length > 0 && (
                                <div className="pt-3">
                                    <p className="text-[13px] text-gray-500 mb-1 flex items-center gap-1">
                                        <Globe size={12} /> Recent Pages
                                    </p>
                                    <ul className="text-[12px] text-gray-700 space-y-1.5 max-h-40 overflow-y-auto">
                                        {pageVisitHistory.recentPageHistory.map((p: any, i: number) => (
                                            <li
                                                key={i}
                                                className="flex items-center justify-between border-b border-gray-50 pb-1 last:border-0"
                                            >
                                                <span>{p.page_title}</span>
                                                <span className="text-gray-400">
                                                    {new Date(p.visited_at).toLocaleString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <NotTracked />
                    )}
                </Card>


                <Card title="Coupon & Wallet" icon={<Wallet size={17} className="text-purple-600" />}>
                    <Stat
                        label="Wallet Balance"
                        value={`₹${Number(couponWallet.walletBalance).toLocaleString("en-IN")}`}
                    />
                    <Stat label="Coupons Used" value={couponWallet.couponsUsed} />
                    <div className="pt-2">
                        <p className="text-[13px] text-gray-500 mb-1">
                            Coupon Codes Used
                        </p>
                        {couponWallet.couponCodesUsed?.length ? (
                            <div className="flex flex-wrap gap-1">
                                {couponWallet.couponCodesUsed.map((c: any) => (
                                    <Badge key={c._id} text={c.code} color="purple" />
                                ))}
                            </div>
                        ) : (
                            <p className="text-[12px] text-gray-400">No coupons used</p>
                        )}
                    </div>
                    <div className="pt-2">
                        <p className="text-[13px] text-gray-500 mb-1">
                            Wallet Transaction History
                        </p>
                        {couponWallet.walletTransactions?.length ? (
                            <ul className="text-[12px] text-gray-700 space-y-1 max-h-32 overflow-y-auto">
                                {couponWallet.walletTransactions.slice(0, 5).map((t: any, i: number) => (
                                    //  {loginHistory.slice(0, 5).map((h: any, i: number) => (
                                    <li key={i} className="flex justify-between">
                                        <span>{t.description || "Transaction"}</span>
                                        <span
                                            className={
                                                t.type === "credit" ? "text-green-600" : "text-red-600"
                                            }
                                        >
                                            {t.type === "credit" ? "+" : "-"}₹{t.amount}
                                        </span>
                                    </li>

                                ))}

                                <li className="flex justify-between font-bold"><span>Total Balance</span>
                                    <span>₹{couponWallet.walletBalance}</span>
                                </li>
                            </ul>
                        ) : (
                            <NotTracked />
                        )}
                    </div>
                </Card>

                <Card title="Shopping Behavior" icon={<ShoppingCart size={17} className="text-orange-600" />}>
                    {shoppingBehavior ? (
                        <>
                            <Stat
                                label="Total Items Purchased"
                                value={shoppingBehavior.totalItemsPurchased}
                            />
                            <Stat
                                label="Average Items per Order"
                                value={shoppingBehavior.avgItemsPerOrder}
                            />
                            <Stat
                                label="Most Purchased Product"
                                value={shoppingBehavior.mostPurchasedProduct || "—"}
                            />
                            <Stat
                                label="Preferred Shopping Day"
                                value={
                                    shoppingBehavior.preferredShoppingDay ? (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} className="text-gray-400" />
                                            {shoppingBehavior.preferredShoppingDay}
                                        </span>
                                    ) : (
                                        "—"
                                    )
                                }
                            />
                            <Stat
                                label="Preferred Shopping Time"
                                value={
                                    shoppingBehavior.preferredShoppingTime ? (
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} className="text-gray-400" />
                                            {shoppingBehavior.preferredShoppingTime}
                                        </span>
                                    ) : (
                                        "—"
                                    )
                                }
                            />
                            <Stat
                                label="Purchase Frequency"
                                value={`${shoppingBehavior.purchaseFrequency} orders/month`}
                            />
                            <Stat
                                label="Cart Abandoned"
                                value={shoppingBehavior.cartAbandoned ? "Yes" : "No"}
                                valueClass={
                                    shoppingBehavior.cartAbandoned ? "text-amber-600" : "text-green-600"
                                }
                            />
                        </>
                    ) : (
                        <NotTracked />
                    )}
                </Card>

                <Card title="Engagement" icon={<Activity size={17} className="text-fuchsia-600" />}>
                    {engagement ? (
                        <>
                            <Stat
                                label="Engagement Level"
                                value={engagement.engagementLevel}
                                valueClass={
                                    engagement.engagementLevel === "Active"
                                        ? "text-green-600"
                                        : engagement.engagementLevel === "Moderate"
                                            ? "text-amber-600"
                                            : "text-red-600"
                                }
                            />
                            <Stat
                                label="Engagement Score"
                                value={`${engagement.engagementScore}/100`}
                                valueClass={
                                    engagement.engagementLevel === "Active"
                                        ? "text-green-600"
                                        : engagement.engagementLevel === "Moderate"
                                            ? "text-amber-600"
                                            : "text-red-600"
                                }
                            />
                            <Stat
                                label="Days Since Last Login"
                                value={
                                    engagement.daysSinceLastLogin !== null
                                        ? `${engagement.daysSinceLastLogin} days ago`
                                        : "Never"
                                }
                            />
                            <Stat
                                label="Login Frequency"
                                value={`${engagement.loginFrequency} / month`}
                            />
                            <Stat
                                label="Logins (Last 30 Days)"
                                value={engagement.recentLogins30d}
                            />
                            <Stat
                                label="Days Since Last Order"
                                value={
                                    engagement.daysSinceLastOrder !== null
                                        ? `${engagement.daysSinceLastOrder} days ago`
                                        : "—"
                                }
                            />
                            <Stat label="Wishlist Items" value={engagement.wishlistCount} />
                            <Stat label="Cart Items" value={engagement.cartCount} />

                            {engagement.signals?.length > 0 && (
                                <div className="pt-2">
                                    <p className="text-[13px] text-gray-500 mb-1">Signals</p>
                                    <div className="flex flex-wrap gap-1">
                                        {engagement.signals.map((s: string, i: number) => (
                                            <Badge key={i} text={s} color="blue" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <NotTracked />
                    )}
                </Card>

                <Card title="Risk & Fraud Detection" icon={<AlertTriangle size={17} className="text-red-600" />}>
                    {data.riskAssessment ? (
                        <>
                            <Stat
                                label="Risk Score"
                                value={`${data.riskAssessment.score}/100`}
                                valueClass={
                                    data.riskAssessment.level === "High"
                                        ? "text-red-600"
                                        : data.riskAssessment.level === "Medium"
                                            ? "text-amber-600"
                                            : "text-green-600"
                                }
                            />
                            <Stat
                                label="Risk Level"
                                value={data.riskAssessment.level}
                                valueClass={
                                    data.riskAssessment.level === "High"
                                        ? "text-red-600"
                                        : data.riskAssessment.level === "Medium"
                                            ? "text-amber-600"
                                            : "text-green-600"
                                }
                            />
                            {data.riskAssessment.flags?.length > 0 && (
                                <div className="pt-2">
                                    <p className="text-[13px] text-gray-500 mb-1">Flags</p>
                                    <div className="flex flex-wrap gap-1">
                                        {data.riskAssessment.flags.map((f: string, i: number) => (
                                            <Badge key={i} text={f} color="red" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <NotTracked />
                    )}
                </Card>

                <Card title="Customer Value (CLV / RFM)" icon={<MapPin size={17} className="text-lime-600" />}>
                    <Stat
                        label="Customer Lifetime Value (≈ Total Spending)"
                        value={`₹${Number(purchaseAnalytics.totalSpending).toLocaleString("en-IN")}`}
                    />
                    <Stat
                        label="Frequency (Total Orders)"
                        value={purchaseAnalytics.totalOrders}
                    />
                    <Stat
                        label="Recency (Last Order)"
                        value={
                            purchaseAnalytics.lastOrderDate
                                ? new Date(purchaseAnalytics.lastOrderDate).toLocaleDateString("en-IN")
                                : "—"
                        }
                    />
                </Card>
            </div>
        </div >
    );
}