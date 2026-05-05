import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSystemSettings } from "../features/systemsetting/systemsetting.Thunk";
import Heading from "../components/ui/Heading";

export default function PrivacyPolicy() {
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
      <Heading title={"Privacy Policy"} />
      {data?.general?.privacyPolicy ? (
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: data.general.privacyPolicy }}
        />
      ) : (
        <p className="text-gray-500">No privacy policy available.</p>
      )}
    </div>
  );
}
