import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSystemSettings } from "../features/systemsetting/systemsetting.Thunk";
import Heading from "../components/ui/Heading";
import SEO from "../components/seo/seo";
import { fetchPageBySlug } from "../features/pages/pagesThunk";

export default function PrivacyPolicy() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.systemseting);
  const { pages, slugLoading } = useSelector((state) => state.pages);
  const privecypage = pages?.find((page) => page.slug === "privacy");

  useEffect(() => {
    dispatch(fetchSystemSettings());
    dispatch(fetchPageBySlug("privacy"));
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
        title={privecypage?.meta_title}
        description={privecypage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${privecypage?.seo_image}`}
      />

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
    </>
  );
}
