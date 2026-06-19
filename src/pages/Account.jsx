import React, { useEffect } from "react";
import UserProfile from "../components/userAccount/UserProfile";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import { useDispatch, useSelector } from "react-redux";
import SEO from "../components/seo/seo";
export default function MyAccount() {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);
  const accountPage = pages?.find((page) => page.slug === "account");

  useEffect(() => {
    dispatch(fetchPageBySlug("account"));
  }, [dispatch]);
  return (
    <>
      <SEO
        title={accountPage?.meta_title}
        description={accountPage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${accountPage?.seo_image}`}
      />

      <div>
        <UserProfile />
      </div>
    </>
  );
}
