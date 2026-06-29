import { useEffect, useState } from "react";
import { Minus, Plus, Eye, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  bulkDeleteWishlistItems,
  fetchWishlistByUser,
  removeWishlistItem,
} from "../../features/wishlist/wishlistThunk";
import { getImageUrl } from "../utils/helper";
import { useNavigate } from "react-router-dom";
import {
  addToCart,
  fetchCart,
  createCart,
  updateCartItem,
} from "../../features/cart/cartThunk";
import toast from "react-hot-toast";

const Wishlist = ({ product }) => {
  const [quantities, setQuantities] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { items = [] } = useSelector((state) => state.wishlist);
  const userId = useSelector((state) => state.auth.user?._id);
  const wishlistId = useSelector((state) => state.wishlist.wishlistId);
  const [selectedItems, setSelectedItems] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);

  const increment = (index) =>
    setQuantities((prev) =>
      prev.map((q, i) => {
        if (i === index) {
          if (q >= 20) {
            toast.error("Maximum 20 quantity allowed per item");
            return q;
          }
          return q + 1;
        }
        return q;
      })
    );

  const decrement = (index) =>
    setQuantities((prev) =>
      prev.map((q, i) => (i === index ? (q > 1 ? q - 1 : 1) : q)),
    );

  useEffect(() => {
    if (userId) {
      dispatch(fetchWishlistByUser(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (Array.isArray(items)) {
      setQuantities(items.map((p) => p.quantity || 1));
    } else {
      setQuantities([]);
    }
  }, [items]);

  const handleRemove = (item_id, wishlistId) => {
    dispatch(removeWishlistItem({ wishlist_id: wishlistId, item_id })).then(
      () => dispatch(fetchWishlistByUser(userId)),
    );
  };

  const formattedItems = Array.isArray(items)
    ? items.map((item) => ({
        ...item,
        product: item.product_id,
        variant: item.variant_id,
      }))
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleAddToCart = async (item, index) => {
    if (!token) {
      toast("Please login to add items to cart");
      navigate("/login");
      return;
    }

    const product_id = item?.product?._id;
    const variant_id = item?.variant?._id;
    const selectedQuantity = quantities[index] ?? 1;

    if (!product_id || !variant_id) {
      toast("Product or variant not found!");
      return;
    }

    setAddingToCart(item._id);

    try {
      let cart_id = localStorage.getItem("cart_id");
     toast.success("cart update sucessfully!")
      if (!cart_id || cart_id === "undefined" || cart_id === "null") {
        try {
          const cartResult = await dispatch(
            createCart({ user_id: userId }),
          ).unwrap();
          cart_id = cartResult._id;
          localStorage.setItem("cart_id", cart_id);
        } catch {
          toast("Could not create cart. Please try again.");
          setAddingToCart(null);
          return;
        }
      }

      const addResult = await dispatch(
        addToCart({
          cart_id,
          product_id,
          variant_id,
          quantity: selectedQuantity,
        }),
      ).unwrap();

      if (selectedQuantity > 1) {
        const cartData = await dispatch(fetchCart(cart_id)).unwrap();

        const cartItems = cartData?.items || [];
        const addedItem = cartItems.find(
          (ci) =>
            ci.product_id?._id === product_id &&
            ci.variant_id?._id === variant_id,
        );


        if (addedItem && addedItem._id) {
          await dispatch(
            updateCartItem({
              cart_id,
              item_id: addedItem._id,
              quantity: selectedQuantity,
            }),
          ).unwrap();
        }
      }

      await dispatch(fetchCart(cart_id));

      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      toast(
        typeof err === "string"
          ? err
          : err?.message || "Failed to add item to cart. Please try again.",
      );
    } finally {
      setAddingToCart(null);
    }
  };

  const getDiscountedPrice = (item) => {
    const originalPrice = Number(
      item?.variant_id?.price || item?.variant?.price || 0,
    );
    const offerPrice = Number(
      item?.variant_id?.offerprice || item?.variant?.offerprice || 0,
    );

    if (offerPrice > 0 && offerPrice < originalPrice) {
      const discountPercent = Math.floor(
        ((originalPrice - offerPrice) / originalPrice) * 100 + 0.5,
      );
      return {
        discount: discountPercent,
        originalPrice,
        discountedPrice: offerPrice,
      };
    }

    const discountValue =
      item?.product_id?.discount_id?.value ||
      item?.product?.discount_id?.value ||
      0;

    const discountedPrice =
      discountValue > 0
        ? Math.round(originalPrice - (originalPrice * discountValue) / 100)
        : originalPrice;

    return {
      discount: discountValue,
      originalPrice,
      discountedPrice,
    };
  };

  useEffect(() => {
    if (selectedItems.length > 0) {
      dispatch(bulkDeleteWishlistItems(selectedItems))
        .unwrap()
        .then(() => {
          toast("Selected wishlist items deleted successfully!");
          setSelectedItems([]);
          dispatch(fetchWishlistByUser(userId));
        })
        .catch(() => {
          toast("Bulk delete failed. Try again.");
        });
    }
  }, [selectedItems]);

  return (
    <div className="w-full">
      {formattedItems.length > 0 ? (
        <>
          <table className="w-full hidden custom-lg:table">
            <thead>
              <tr className="border-b border-black font-18">
                <th className="text-left p-4 font-normal">Product</th>
                <th className="text-center p-4 font-normal">Quantity</th>
                <th className="text-left p-4 font-normal">Price</th>
                <th className="text-left p-4 font-normal">Stock</th>
                <th className="text-right p-4 font-normal">Action</th>
              </tr>
            </thead>

            <tbody>
              {formattedItems.map((item, index) => (
                <tr key={item._id} className="border-b light-border">
                  <td className="p-4 py-[40px] flex items-center gap-[25px] xl:gap-[40px]">
                    <img
                      src={
                        item.variant_id?.images?.length > 0
                          ? getImageUrl(item.variant_id.images[0])
                          : getImageUrl(item.product_id?.images?.[0])
                      }
                      alt={item.product_id?.name}
                      className="w-[74px] h-[84px] p-[5px] box-shadow"
                    />

                    <div className="text-p break">
                      <h3 className=" leading-tight  line-clamp-2 ">
                        {item.product?.name}
                      </h3>
                      <p>
                        SKU :{" "}
                        <span className="sec-text-color">
                          {item.variant?.sku || item.variant?.sku || "N/A"}
                        </span>
                      </p>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-[10px] px-[8px] py-[6px] light-border border text-black rounded-[3px]">
                      <button onClick={() => decrement(index)}>
                        <Minus size={14} />
                      </button>
                      <span>{quantities[index]}</span>
                      <button
                        onClick={() => increment(index)}
                        disabled={quantities[index] >= 20}
                        className="disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>

                  <td className="p-4">
                    {getDiscountedPrice(item).discount > 0 && (
                      <span className="sec-text-color text-14 line-through mr-[5px]">
                        ₹
                        {Number(
                          getDiscountedPrice(item).originalPrice,
                        ).toLocaleString("en-IN")}{" "}
                      </span>
                    )}
                    <span className="text-p">
                      ₹
                      {Number(
                        getDiscountedPrice(item).discountedPrice,
                      ).toLocaleString("en-IN")}
                    </span>
                  </td>

                  <td className="p-4 text-p">
                    {item.variant?.stock_quantity > 0 ? (
                      <span className="text-[#3EE878] flex gap-[5px]">
                        ✔ In Stock
                      </span>
                    ) : (
                      <span className="text-[#EB1724] flex gap-[5px]">
                        ✖ Out of Stock
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col items-end gap-[8px]">
                      <div className="flex items-center gap-[5px]">
                        <Eye
                          size={30}
                          className="border light-border rounded-[3px] p-[4px]"
                          onClick={() =>
                            navigate(`/products/${item?.product?._id}`)
                          }
                        />
                        <Button
                          variant="common"
                          onClick={() => handleAddToCart(item, index)}
                          aria-label="add to cart"
                          className="!min-w-[113px] !py-[5px] !px-[8px] text-14"
                        >
                          Add To Cart
                        </Button>
                        <Trash2
                          size={30}
                          className="border rounded-[3px] p-[4px] cursor-pointer"
                          onClick={() => handleRemove(item._id, wishlistId)}
                        />
                      </div>
                      <div className="text-[12px] text-[#BCBCBC]">
                        <span>Added on {formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-center py-6 text-gray-500 text-lg">
          Your wishlist is empty.
        </p>
      )}

      <div className="flex flex-col gap-4 custom-lg:hidden mt-4">
        {formattedItems.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-[5px] box-shadow flex sm:flex-nowrap gap-[20px] items-start"
          >
            <img
              src={
                item.variant_id?.images?.length > 0
                  ? getImageUrl(item.variant_id.images[0])
                  : getImageUrl(item.product_id?.images?.[0])
              }
              alt={item.product_id?.name}
              className="w-[90px] h-[110px] p-[5px] box-shadow"
            />

            <div className="flex-1 flex flex-col text-p">
              <h3 className="mb-[5px] break text-14 line-clamp-2">
                {item.product?.name}
              </h3>
              <p className="mb-[10px] text-14">
                SKU :{" "}
                <span className="sec-text-color">
                  {item.variant?.sku || item.variant?.sku || "N/A"}
                </span>
              </p>

              <div className="flex items-center gap-[10px] text-14 mb-[10px]">
                <button
                  className="light-color rounded-[2px] flex items-center justify-center p-[2px]"
                  onClick={() => decrement(index)}
                >
                  <Minus size={12} />
                </button>
                <span>{quantities[index]}</span>
                <button
                  className="bg-color-100 rounded-[2px] flex items-center justify-center p-[2px] text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={() => increment(index)}
                  disabled={quantities[index] >= 20}
                >
                  <Plus size={12} />
                </button>
              </div>

              <div className="flex gap-[5px] items-center mb-[5px]">
                {getDiscountedPrice(item).discount > 0 && (
                  <span className="sec-text-color text-14 line-through mr-1">
                    ₹{getDiscountedPrice(item).originalPrice}
                  </span>
                )}
                <span className="text-p">
                  ₹{getDiscountedPrice(item).discountedPrice.toFixed(0)}
                </span>
              </div>

              <div>
                {item.variant?.stock_quantity > 0 ? (
                  <span className="text-[#3EE878] flex gap-[5px]">
                    ✔ In Stock
                  </span>
                ) : (
                  <span className="text-[#EB1724] flex gap-[5px]">
                    ✖ Out of Stock
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center mt-2 gap-2 max-[360px]:flex-col max-[360px]:items-start">
                <div className="flex gap-2">
                  <Eye
                    size={24}
                    className="border p-1 rounded-md"
                    onClick={() => navigate(`/products/${item?.product?._id}`)}
                  />
                  <Trash2
                    size={24}
                    className="border p-1 rounded-md"
                    onClick={() => handleRemove(item._id, wishlistId)}
                  />
                </div>
                <Button
                  variant="common"
                  onClick={() => handleAddToCart(item, index)}
                  className="!min-w-[100px] !py-1 !px-4 !text-sm"
                >
                  Add To Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
