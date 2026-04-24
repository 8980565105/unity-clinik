import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ResultsCard from "../components/results/ResultsCard";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import { fetchResults } from "../features/results/resultsThunk";
import SEO from "../components/seo/seo";
import { fetchPageBySlug } from "../features/pages/pagesThunk";

const BASE_URL = process.env.REACT_APP_API_URL_IMAGE || "";
function Modal({ data, onClose }) {
  const [expand, setExpand] = useState(false);

  if (!data) return null;

  const beforeSrc = data.before_image_url
    ? `${BASE_URL}${data.before_image_url}`
    : "";

  const afterSrc = data.after_image_url
    ? `${BASE_URL}${data.after_image_url}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl w-[600px] max-h-[85vh] overflow-y-auto p-4 z-50 shadow-2xl">
        <div className="flex gap-2">
          <div className="w-1/2 relative rounded-lg overflow-hidden">
            <span className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded shadow-sm z-10">
              Before
            </span>
            <img
              src={beforeSrc}
              alt="Before"
              className="w-full h-50 object-cover"
            />
          </div>
          <div className="w-1/2 relative rounded-lg overflow-hidden">
            <span className="absolute top-2 right-2 bg-white text-xs px-2 py-1 rounded shadow-sm z-10">
              After
            </span>
            <img
              src={afterSrc}
              alt="After"
              className="w-full h-50 object-cover"
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm my-2">
          <span className="font-semibold text-gray-800">
            {data.name}
            {data.gander ? `, ${data.gander}` : ""}
            {data.age ? `, ${data.age}` : ""}
          </span>
        </div>
        <div className="text-sm text-gray-800 px-1">
          <div
            className={`prose prose-sm max-w-none ${!expand ? "line-clamp-4" : ""}`}
            dangerouslySetInnerHTML={{ __html: data.description || "" }}
          />
          {data.description && (
            <button
              onClick={() => setExpand(!expand)}
              className="text-blue-600 mt-2 block text-right w-full"
            >
              {expand ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default function Result() {
  const dispatch = useDispatch();
  const { results } = useSelector((state) => state.results);
  const [selected, setSelected] = useState(null);
  const { pages } = useSelector((state) => state.pages);

  const [visibleCount, setVisibleCount] = useState(6);
  const resultsPage = pages?.find((page) => page.slug === "results");

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  useEffect(() => {
    dispatch(fetchPageBySlug("results"));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchResults());
  }, [dispatch]);
  
  return (
    <>
      <SEO
        title={resultsPage?.meta_title || "result page"}
        description={resultsPage?.meta_description || "result page description"}
      />

      <Section>
        <Row>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              {results.slice(0, visibleCount).map((item) => (
                <ResultsCard key={item._id} item={item} onOpen={setSelected} />
              ))}
            </div>

            {visibleCount < results.length && (
              <div className="flex justify-center mt-[50px]">
                <button
                  onClick={handleLoadMore}
                  className="text-[18px] theme-border text-theme w-[187px] h-[70px] sm:w-[220px] sm:h-[75px] font-medium rounded-[10px] shadow-lg transition duration-300 uppercase"
                  style={{
                    boxShadow: "inset 0px 0px 30px ",
                  }}
                >
                  Load More
                </button>
              </div>
            )}

            {results.length === 0 && (
              <div className="text-center text-gray-400 py-20">
                No results found.
              </div>
            )}

            {selected && (
              <Modal data={selected} onClose={() => setSelected(null)} />
            )}
          </div>
        </Row>
      </Section>
    </>
  );
}
