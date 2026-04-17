import { Link } from "react-router-dom";
import offerbg from "../../assets/offerBg.png";
import Button from "../ui/Button";
import Row from "../ui/Row";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../../features/pages/pagesThunk";
import { useEffect } from "react";
import { getImageUrl } from "../utils/helper";

const offerBannerItem = {
  title: "Up To 20%",
  description: "Best outfits for every occasion",
  button_name: "Shop Now",
  button_link: "/shop",
  image_url: offerbg,
  isStatic: true,
};

export default function OfferBanner() {
  const dispatch = useDispatch();
  const { pages, slugLoading } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPageBySlug("offer"));
  }, [dispatch]);

  const offerPage = pages?.find((page) => page.slug === "offer");
  const bannerSectionFromApi = offerPage?.sections?.find(
    (section) => section.order === 1,
  );
  const salebanner = bannerSectionFromApi || offerBannerItem;

  const bgImage = salebanner?.isStatic
    ? salebanner.image_url
    : getImageUrl(salebanner.background_image_url || salebanner.image_url);

  return (
    <div
      className="w-full max-w-screen mx-auto flex flex-col lg:flex-row items-center space-y-8 lg:space-y-0 px-4 sm:px-6 xl:px-0 bg-cover bg-no-repeat bg-center py-[7rem] md:m-0 min-h-[400px] lg:min-h-[600px] xl:min-h-[776px]"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <Row className="w-full flex justify-end items-center max-w-[1440px] mx-auto">
        <div className="w-full lg:w-1/2"></div>
        <div className="w-full lg:w-1/2 md:w-2/1 flex flex-col items-end text-right">
          <h2 className="xl:text-[62px] lg:text-[48px] sm:text-[20px] font-bold text-theme mb-[10px] xl:mb-[40px] leading break">
            {salebanner.title || offerBannerItem.title}
          </h2>
          <h1 className="text-[30px] md:text-[70px] xl:text-[120px] font-bold leading-[100%] md:leading-[60px] xl:leading-[111px] text-[#D2AF9F] mb-5 break-words">
            LIMITED DISCOUNT
          </h1>
          <p className="text-p text-light mb-3 max-w-[327px] md:mb-11 sm:text-[10px] md:text-[10px]">
            {salebanner.description || offerBannerItem.description}
          </p>
          <Button
            variant="common"
            onClick={() =>
              (window.location.href =
                salebanner.button_link || offerBannerItem.button_link)
            }
          >
            <Link to={salebanner.button_link || "/shop"}>
              {salebanner.button_name || offerBannerItem.button_name}
            </Link>
          </Button>
        </div>
      </Row>
    </div>
  );
}
