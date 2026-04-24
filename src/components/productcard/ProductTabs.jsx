import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
export default function ProductTabs({ product, selectedVariant }) {
  const tabs = ["Details", "How to Use"];
  const [activeTab, setActiveTab] = useState("Details");
  const [openAccordion, setOpenAccordion] = useState(null);
  const dispatch = useDispatch();
  const handleAccordionToggle = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };
  const isValidHtml = (html) =>
    html && html.trim() !== "" && html.trim() !== "<p></p>";

  const activeDescription = isValidHtml(selectedVariant?.description)
    ? selectedVariant.description
    : product?.description;

  const activeSteps = isValidHtml(product?.steps) ? product.steps : null;
  return (
    <div>
      <div className="hidden md:flex w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-[30px] py-[14px] text-center font-18 ${
              activeTab === tab
                ? "text-white border-b-0 border border-[#BCBCBC] bg-primary"
                : "text-black border-b border-[#BCBCBC]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="hidden md:block border border-[#BCBCBC] border-t-0 ps-[38px] py-[45px]">
        {activeTab === "Details" && (
          <div className="prose max-w-full">
            {activeDescription ? (
              <div dangerouslySetInnerHTML={{ __html: activeDescription }} />
            ) : (
              <p>Product details coming soon.</p>
            )}
          </div>
        )}

        {activeTab === "How to Use" && (
          <div className="prose max-w-full">
            {activeSteps ? (
              <div dangerouslySetInnerHTML={{ __html: activeSteps }} />
            ) : (
              <p>How to use information coming soon.</p>
            )}
          </div>
        )}
      </div>

      <div className="md:hidden">
        {tabs.map((tab, index) => (
          <div key={index} className="border-b border-[#BCBCBC]">
            <button
              className="w-full flex justify-between items-center py-4 text-left font-18"
              onClick={() => handleAccordionToggle(index)}
            >
              {tab}
              {openAccordion === index ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {openAccordion === index && (
              <div className="pb-4">
                {index === 0 && (
                  <div className="prose max-w-full">
                    {activeDescription ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: activeDescription }}
                      />
                    ) : (
                      <p>Product details coming soon.</p>
                    )}
                  </div>
                )}

                {index === 1 && (
                  <div className="prose max-w-full">
                    {activeSteps ? (
                      <div dangerouslySetInnerHTML={{ __html: activeSteps }} />
                    ) : (
                      <p>How to use information coming soon.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
