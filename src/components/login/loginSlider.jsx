import Slider from "react-slick";
// import heroImg1 from "../../assets/slider.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchPages } from "../../features/pages/pagesThunk";
import { useEffect } from "react";
import { getImageUrl } from "../utils/helper";

export default function LoginSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    appendDots: (dots) => (
      <div className="w-full relative">
        <ul className="absolute left-1/2 transform -translate-x-1/2 flex justify-center  mt-5">
          {dots}
        </ul>
      </div>
    ),
    customPaging: (i) => (
      <div className="w-[10px] h-[10px] bg-[#D2AF9F] transition-colors duration-300 rounded-full"></div>
    ),
  };

  const dispatch = useDispatch();
  const { pages, loading } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPages());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  const loginPage = pages?.find((page) => page.slug === "login");
  const heroSection = loginPage?.sections?.find(
    (sec) => sec.type === "hero_slider",
  );

  const heroSlides = [
    ...(heroSection?.image_url
      ? [{ background_image_url: heroSection.image_url }]
      : []),
    ...(heroSection?.slides || []),
  ];

  return (
    <div className="w-full flex items-center justify-center px-5 ">
      <Slider {...settings} className="w-full h-full loginSlider">
        {heroSlides.length > 0 ? (
          heroSlides.map((slide, index) => (
            <div key={index} className="flex justify-center items-center">
              <img
                src={getImageUrl(slide.background_image_url)}
                alt={slide.title || `Slide ${index + 1}`}
                className="object-contain bg-transparent max-h-[448px] w-full"
              />
            </div>
          ))
        ) : (
          <div>
            <img
              src="/placeholder.png"
              alt="Default Slide"
              className="object-contain bg-transparent max-h-[448px] w-full"
            />
          </div>
        )}
      </Slider>
    </div>
  );
}
