import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSlides } from "../../features/slides/slideThunk";
import Row from "../ui/Row";
import Section from "../ui/Section";
import { Star } from "lucide-react";
import Heading from "../ui/Heading";

const BASE_URL = process.env.REACT_APP_API_URL_IMAGE;

const imgSrc = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

export default function ReportCard() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { slides } = useSelector((state) => state.slides);
  const sectionData = slides?.find((item) => item.section === "reportCard");

  useEffect(() => {
    dispatch(fetchSlides());
  }, [dispatch]);

  const currentPage = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path === "/") return "home";
    return path.replace("/", "");
  }, [location.pathname]);

  const shouldShow = sectionData?.showOnPages?.includes(currentPage);

  const reviews =
    sectionData?.reportCardSlides?.filter((s) => s.status !== "inactive") || [];

  if (!sectionData) return null;
  if (!shouldShow) return null;
  if (!reviews.length) return null;

  return (
    <Section>
      {sectionData?.reportCardTitle && (
        <Heading title={sectionData.reportCardTitle} />
      )}
      <Row>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={review._id || index}
              className="rounded-[24px] border border-gray-200 bg-[#FAFAF5] p-4 shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="relative rounded-[14px] overflow-hidden">
                  <img
                    src={imgSrc(review.beforeImage)}
                    alt={`${review.name} before`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-[180px] object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-[#0f2c5c]/90 text-white text-center text-sm font-semibold py-1 rounded-md">
                    {review.beforeMonth}
                  </div>
                </div>
                <div className="relative rounded-[14px] overflow-hidden">
                  <img
                    src={imgSrc(review.afterImage)}
                    alt={`${review.name} after`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-[180px] object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-[#0f2c5c]/90 text-white text-center text-sm font-semibold py-1 rounded-md">
                    {review.afterMonth}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-left">
                <span className="inline-block bg-gray-100 text-gray-700 text-[13px] font-medium px-2 py-1 rounded-md">
                  {review.stage}
                </span>

                <h2 className="mt-2 text-[20px] font-bold text-[#0f2c5c]">
                  {review.title}
                </h2>

                <p className="mt-2 text-gray-600 text-[15px] leading-6">
                  {review.description}
                </p>

                <div className="mt-4 flex items-center gap-1">
                  <span className="font-bold text-gray-800">
                    {review.name},
                  </span>
                  <span className="text-gray-500">{review.age}</span>
                  <span className="text-yellow-500">
                    <Star
                      size={18}
                      fill={"#fbbf24"}
                      className={"text-yellow-400"}
                    />
                  </span>
                  <span className="font-semibold text-gray-700">
                    {review.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Row>
    </Section>
  );
}
