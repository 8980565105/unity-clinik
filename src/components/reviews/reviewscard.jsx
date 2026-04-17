// // import shap from "../../assets/shap.png"

// //  function ReviewCard({ review }) {
// //   return (
// //     <div className="bg-white border rounded-xl p-4 sm:p-5 shadow-sm h-full flex flex-col justify-between">
// //       <div className="flex text-yellow-400 text-sm mb-2">
// //         {"★".repeat(review?.rating || 0)}
// //       </div>

// //       <p className="text-gray-600 text-sm leading-relaxed mb-4">
// //         "{review?.comment}"
// //       </p>

// //       <div className="flex items-center justify-between mt-auto">
// //         <div className="flex items-center gap-3">
// //           <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
// //             {review?.user_id?.name?.charAt(0) || "U"}
// //           </div>

// //           <div>
// //             <p className="text-sm font-medium truncate max-w-[100px] sm:max-w-[140px]">
// //               {review?.user_id?.name || "User"}
// //             </p>
// //             <p className="text-xs text-gray-500">Verified</p>
// //           </div>
// //         </div>

// //         <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
// //           {new Date(review?.createdAt).toLocaleDateString("en-GB", {
// //             day: "2-digit",
// //             month: "short",
// //             year: "numeric",
// //           })}
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// // export default ReviewCard;



// import shap from "../../assets/shap1.png";

// const AVATAR_COLORS = ["#4caf50", "#29b6f6", "#ffa726", "#ef5350", "#ab47bc"];

// function ReviewCard({ review, index = 0 }) {
//   const color = AVATAR_COLORS[index % AVATAR_COLORS.length];

//   return (
//     <div className="relative w-[280px] h-[260px]">
      
//       {/* Background Shape Image */}
//       <img
//         src={shap}
//         alt=""
//         className="absolute inset-0 w-full h-full object-fill"
//       />

//       {/* Content over shape */}
//       <div className="relative z-10 h-full flex flex-col justify-between p-6">
        
//         {/* Top: Avatar + Name */}
//         <div className="flex items-center gap-3">
//           <div
//             className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
//             style={{ backgroundColor: color }}
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
//               <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
//             </svg>
//           </div>
//           <div>
//             <p className="text-sm font-bold text-gray-800 leading-tight">
//               {review?.user_id?.name || "Client Name"}
//             </p>
//             <p className="text-xs text-gray-400">Client Designation</p>
//           </div>
//         </div>

//         {/* Stars */}
//         <div className="text-yellow-400 text-sm">
//           {"★".repeat(review?.rating || 5)}
//           <span className="text-gray-300">
//             {"★".repeat(5 - (review?.rating || 5))}
//           </span>
//         </div>

//         {/* Comment */}
//         <p className="text-gray-500 text-xs leading-relaxed line-clamp-5">
//           {review?.comment ||
//             "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua nostrud."}
//         </p>

//         {/* Bottom quote */}
//         <div className="flex justify-end">
//           <svg width="26" height="18" viewBox="0 0 24 24" fill="#d1d5db">
//             <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ReviewCard;

import shap from "../../assets/shap1.png";

const AVATAR_COLORS = ["#4caf50", "#29b6f6", "#ffa726", "#ef5350", "#ab47bc"];

function ReviewCard({ review, index = 0 }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    // outer wrapper — extra left padding so avatar can overflow left
    <div className="relative pl-5 w-[300px]">

      {/* Card with shape image */}
      <div className="relative w-full h-[280px]">

        {/* Background Shape Image */}
        <img
          src={shap}
          alt=""
          className="absolute inset-0 w-full h-full object-fill"
        />

        {/* Avatar — half outside left edge of card */}
        <div
          className="absolute -left-4 top-1/4 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-20 shadow-sm"
          style={{ backgroundColor: color }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
          </svg>
        </div>

        {/* Content — left padding so text doesn't go under avatar */}
        <div className="relative z-10 h-full flex flex-col justify-between p-5 pl-12">

          {/* Name + Designation */}
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">
              {review?.user_id?.name || "Client Name"}
            </p>
            <p className="text-xs text-gray-400">Client Designation</p>
          </div>

          {/* Stars */}
          <div className="text-yellow-400 text-sm">
            {"★".repeat(review?.rating || 5)}
            <span className="text-gray-300">
              {"★".repeat(5 - (review?.rating || 5))}
            </span>
          </div>

          {/* Comment */}
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-5">
            {review?.comment ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua nostrud."}
          </p>

          {/* Bottom right quote icon */}
          <div className="flex justify-end">
            <svg width="26" height="18" viewBox="0 0 24 24" fill="#d1d5db">
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ReviewCard;