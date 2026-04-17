
import React, { useEffect } from "react";
import Row from "../ui/Row";
import { useDispatch, useSelector } from "react-redux";
import { fetchPages } from "../../features/pages/pagesThunk";
import { fetchSizes } from "../../features/sizes/sizesThunk";
import { getImageUrl } from "../utils/helper";

export default function SizeSection() {
  const dispatch = useDispatch();
  const { pages, loading, error } = useSelector((state) => state.pages);
  const {
    sizes,
    loading: sizeLoading,
    error: sizeError,
  } = useSelector((state) => state.sizes);

  useEffect(() => {
    dispatch(fetchPages());
    dispatch(fetchSizes());
  }, [, dispatch]);

  const offerpage = pages?.find((page) => page.slug === "offer");
  const salebanner = offerpage?.sections?.find(
    (section) => section.order === 3,
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!salebanner) return <p>No Section 9 Found</p>;

  return (
    <>
      <Row>
        <div className="flex flex-wrap justify-center gap-5 max-w-[880px] mx-auto">
          {sizes && sizes.length > 0 ? (
            sizes.map((size) => (
              <div
                key={size._id}
                className="flex flex-col bg-cover bg-no-repeat bg-center p-5 items-center justify-center w-[130px] h-[130px] rounded-full box-shadow
                                                  hover:scale-105 transition-transform duration-200 cursor-pointer"
                style={{
                  backgroundImage: salebanner?.image_url
                    ? `url(${getImageUrl(salebanner.image_url)})`
                    : "none",
                }}
              >
                <p className="text-[24px] text-dark leading pb-2">Size</p>
                <p className="text-[52px] font-medium text-dark leading">
                  {size.name}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center w-full">
              No sizes available
            </p>
          )}
        </div>
      </Row>
      <Row>
        <div className="mt-[60px] mx-auto max-w-[1122px] border-2 border-[#F43297] rounded-md text-14 py-7 px-[10px] md:px-[75px] text-center text-light">
          {salebanner.description}
        </div>
      </Row>
    </>
  );
}
