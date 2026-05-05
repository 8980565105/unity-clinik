import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSystemSettings } from "../features/systemsetting/systemsetting.Thunk";
import Heading from "../components/ui/Heading";

export default function ShippingPolicy() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.systemseting);

  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Heading title={"Shipping and Delivery Policy"} />

      {data?.general?.shippingPolicy ? (
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: data.general.shippingPolicy }}
        />
      ) : (
        <p className="text-gray-500">No Shipping policy available.</p>
      )}
    </div>
  );
}
