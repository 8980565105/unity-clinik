import toast from "react-hot-toast";
import ShareIcon from "../icons/Shere";

export default function Sharelink({ product }) {
    const handleShare = async () => {
        const productUrl = `${window.location.origin}/products/${product?._id}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: product?.name,
                    text: `Check out this product`,
                    url: productUrl,
                });
            } else {
                await navigator.clipboard.writeText(productUrl);
                toast.success("Product link copied!");
            }
        } catch (error) {
            console.log("Share cancelled", error);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="share product"
        >
            <ShareIcon />
        </button>
    );
}