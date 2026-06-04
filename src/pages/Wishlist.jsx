import SecondarySection from "../components/ui/SecondarySection";
import WishlistTable from "../components/wishlist/WishlistTable";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import { useDispatch, useSelector } from "react-redux";
import { fetchPages } from "../features/pages/pagesThunk";
import { useEffect } from "react";
import { getImageUrl } from "../components/utils/helper";
import wishlistBg from "../assets/wishlistbg.png";
import Loding from "../components/loding/loding";
import SEO from "../components/seo/seo";
const staticBg = {
  sections: [
    {
      _id: "static-1",
      title: "Wishlist",
      description: "Your Favourites item added.",
      image_url: wishlistBg,
      isStatic: true,
    },
  ],
};
export default function Wishlist() {
  const dispatch = useDispatch();
  const { pages, slugLoading } = useSelector((state) => state.pages);

  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchPages());
  }, [dispatch]);

  const wishlistpage =
    pages.find((page) => page.slug === "wishlist") || staticBg;

  if (slugLoading) return <Loding />;
  return (
    <>
      <SEO
        title={wishlistpage?.meta_title}
        description={wishlistpage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${wishlistpage?.seo_image}`}
      />

      {wishlistpage?.sections.map((section) => (
        <SecondarySection
          key={section._id}
          title={section.title}
          description={section.description}
          backgroundImage={
            section.isStatic
              ? section.image_url
              : getImageUrl(section.image_url)
          }
        />
      ))}
      <Section>
        <Row className="pt-[50px]">
          <WishlistTable products={products} />
        </Row>
      </Section>
    </>
  );
}
