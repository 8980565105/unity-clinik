// src/components/icons/DiscountStarIcon.jsx
import * as React from "react";

const DiscountStarIcon = ({ className = "", ...props }) => (
 <svg
 xmlns="http://www.w3.org/2000/svg"
 viewBox="-10 -20 130 130" // Expanded viewBox to fit full star
 preserveAspectRatio="xMidYMid meet" // Ensures star never cuts
 className={`w-full h-full ${className}`}
 {...props}
 >
 <path
 fill="#F43297" // Pink color from the image
 stroke="#F43297"
 d="m55.158 14.165 20.06-12.884 13.115 19.941 21.98 7.253-3.835 20.337 15.989 24.312-20.059 12.884-8.75 23.882-25.638-1.795-24.73 5.782-11.319-17.21L9.697 93.1l4.129-24.023L.711 49.137l20.06-12.885 7.492-25.794 26.895 3.707Z"
 />
 </svg>
);

export default DiscountStarIcon;