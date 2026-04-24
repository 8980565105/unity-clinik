import React from "react";
const BASE_URL = process.env.REACT_APP_API_URL_IMAGE || "";
export default function ResultsCard({ item, onOpen }) {
  const beforeSrc = item.before_image_url
    ? `${BASE_URL}${item.before_image_url}`
    : "";
  const afterSrc = item.after_image_url
    ? `${BASE_URL}${item.after_image_url}`
    : "";
  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
      onClick={() => onOpen(item)}
    >
      <div className="flex">
        <div className="w-1/2 relative">
          <span className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded shadow-sm z-10">
            Before
          </span>
          <img
            src={beforeSrc}
            alt="Before"
            className="h-auto w-full object-cover"
          />
        </div>
        <div className="w-1/2 relative">
          <span className="absolute top-2 right-2 bg-white text-xs px-2 py-1 rounded shadow-sm z-10">
            After
          </span>
          <img
            src={afterSrc}
            alt="After"
            className="h-auto w-full object-cover"
          />
        </div>
      </div>

      <div className="p-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-800">
          {item.name}
          {item.gander ? `, ${item.gander}` : ""}
          {item.age ? `, ${item.age}` : ""}
        </span>
        <span className="text-blue-600 font-medium">Full Case →</span>
      </div>
    </div>
  );
}
