// import toast from "react-hot-toast";
// import ShareIcon from "../icons/Shere";

// export default function Sharelink({ product }) {
//     const handleShare = async () => {
//         const productUrl = `${window.location.origin}/products/${product?._id}`;

//         try {
//             if (navigator.share) {
//                 await navigator.share({
//                     title: product?.name,
//                     text: `Check out this product`,
//                     url: productUrl,
//                 });
//             } else {
//                 await navigator.clipboard.writeText(productUrl);
//                 toast.success("Product link copied!");
//             }
//         } catch (error) {
//         }
//     };

//     return (
//         <button
//             onClick={handleShare}
//             className="p-2 rounded-md hover:bg-gray-100"
//             aria-label="share product"
//         >
//             <ShareIcon />
//         </button>
//     );
// }
import toast from "react-hot-toast";
import ShareIcon from "../icons/Shere";

export default function Sharelink({
  product,
  shareUrl,
  shareTitle,
  shareText,
  className,
}) {
  const handleShare = async () => {
    const url =
      shareUrl || `${window.location.origin}/products/${product?._id}`;
    const title = shareTitle || product?.name || "Check this out";
    const text = shareText || "Check out this product";

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      }
    } catch (error) {
     
    }
  };

  return (
    <button
      onClick={handleShare}
      className={className || "p-2 rounded-md hover:bg-gray-100"}
      aria-label="share"
    >
      <ShareIcon />
    </button>
  );
}
