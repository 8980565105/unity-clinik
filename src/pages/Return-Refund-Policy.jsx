import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSystemSettings } from "../features/systemsetting/systemsetting.Thunk";
import Heading from "../components/ui/Heading";
import SEO from "../components/seo/seo";
import { fetchPageBySlug } from "../features/pages/pagesThunk";

export default function RefundPolicy() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.systemseting);
  const { pages, slugLoading } = useSelector((state) => state.pages);
  const ReturnPage = pages?.find((page) => page.slug === "returns");
  useEffect(() => {
    dispatch(fetchSystemSettings());
    dispatch(fetchPageBySlug("returns"));
  }, [dispatch]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={ReturnPage?.meta_title}
        description={ReturnPage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${ReturnPage?.seo_image}`}
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Heading title={"Return & Refund Policy"} />

        {data?.general?.refundPolicy ? (
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: data.general.refundPolicy }}
          />
        ) : (
          <p className="text-gray-500">No Return & refund Policy available.</p>
        )}
      </div>
    </>
  );
}
