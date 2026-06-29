// import { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPublicPopup } from "../../features/popup/popupThunk";
// import Button from "../ui/Button";
// import LoginForm from "../../pages/Login";
// import RegistrationForm from "../../pages/RegistrationForm";
// import ForgetForm from "../../pages/ForgetForm";

// export default function CouponSidebar() {
//   const dispatch = useDispatch();
//   const { data: popupData, loading } = useSelector((state) => state.popup);
//   const [open, setOpen] = useState(false);

//   const [isLoginOpen, setIsLoginOpen] = useState(false);
//   const [isRegisterOpen, setIsRegisterOpen] = useState(false);
//   const [isForgetOpen, setIsForgetOpen] = useState(false);

//   useEffect(() => {
//     dispatch(fetchPublicPopup());
//   }, [dispatch]);

//   const handleSignUpNow = () => {
//     const user = localStorage.getItem("user");
//     if (user) {
//       toast.success("You are already logged in!");
//       setOpen(false);
//     } else {
//       setIsLoginOpen(true);
//       setOpen(false);
//     }
//   };

//   const handleCopyCoupon = async () => {
//     if (!popupData || !popupData.couponCode) return;
//     try {
//       await navigator.clipboard.writeText(popupData.couponCode);
//       toast.success("Coupon code copied successfully!");
//     } catch (error) {
//       toast.error("Failed to copy coupon code");
//     }
//   };

//   if (loading || !popupData || popupData.status !== "active") {
//     return null;
//   }

//   return (
//     <>
//       <div
//         className={`fixed inset-0 bg-black/40 z-[998] transition-opacity duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"
//           }`}
//         onClick={() => setOpen(false)}
//       />

//       <div
//         className="fixed right-0 top-1/2 z-[999] flex items-stretch transition-transform duration-500 ease-in-out"
//         style={{
//           transform: open
//             ? "translate3d(0, -50%, 0)"
//             : "translate3d(calc(100% - 48px), -50%, 0)",
//         }}
//       >
//         <div
//           onClick={() => setOpen(!open)}
//           className="w-12 bg-[#282c3f] hover:bg-[#3e4152] text-white flex flex-col items-center
//                     justify-between py-6 cursor-pointer rounded-l-2xl shadow-2xl border-r border-[#3e4152]/30 select-none h-[250px] md:h-[325px]"
//           style={{ alignSelf: "center" }}
//         >
//           <div className="flex items-center justify-center">
//             {open ? (
//               <svg
//                 className="w-8 h-8 text-white fill-current"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M8 5v14l11-7z" />
//               </svg>
//             ) : (
//               <svg
//                 className="w-8 h-8 text-white fill-current animate-pulse"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M16 5v14l-11-7z" />
//               </svg>
//             )}
//           </div>

//           <div
//             className="font-bold tracking-wider text-[15px] whitespace-nowrap"
//             style={{
//               writingMode: "vertical-rl",
//               transform: "rotate(180deg)",
//             }}
//           >
//             {popupData.title.toUpperCase().includes("UPTO") || popupData.title.toUpperCase().includes("₹") || popupData.title.toUpperCase().includes("%")
//               ? popupData.title.toUpperCase()
//               : `${popupData.title.toUpperCase()}`}
//           </div>

//           <div className="h-2" />
//         </div>

//         <div
//           className="w-[500px] max-w-[calc(100vw-60px)] bg-gradient-to-br from-[#FFF0F6] via-[#FFF8EE] to-[#FFF9F2] shadow-2xl
//                 relative flex flex-col justify-between overflow-hidden border-y border-l border-pink-100"
//         >
//           <div className="p-2 md:p-8 flex-1 flex flex-col justify-between h-[250px] md:h-[325px]">
//             <div className="flex justify-between items-start gap-6 mt-4">
//               <div className="flex-1 text-left">
//                 <p className="text-[16px] uppercase tracking-widest text-[#7e818c] font-bold mb-1">
//                   Avail Upto
//                 </p>

//                 <h2 className="text-[30px] md:text-6xl font-black text-[#3e4152] leading-none mb-5">
//                   {popupData.title}
//                 </h2>
//                 <button
//                   onClick={handleCopyCoupon}
//                   className="inline-flex items-center gap-1.5 bg-white/70 border border-dashed border-primary rounded-lg px-3.5 py-2 hover:bg-white transition-all cursor-pointer"
//                 >
//                   <span className="text-xs font-semibold text-[#535766]">
//                     Coupon Code:
//                   </span>

//                   <span className="text-sm font-extrabold text-primary tracking-wide select-all">
//                     {popupData.couponCode}
//                   </span>

//                   <span className="text-[10px] bg-primary text-white px-2 py-1 rounded">
//                     COPY
//                   </span>
//                 </button>

//                 <p className="text-[16px] text-[#7e818c] mt-2 font-medium">
//                   {popupData.description}
//                 </p>
//               </div>
//             </div>

//             <div className="mt-8 flex justify-start">
//               <Button
//                 onClick={handleSignUpNow}
//                 variant="common"
//               >
//                 {popupData.buttonText || "SIGN UP NOW"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//       {isLoginOpen && (
//         <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
//           <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
//             <LoginForm
//               onClose={() => setIsLoginOpen(false)}
//               onSwitchRegister={() => {
//                 setIsLoginOpen(false);
//                 setIsRegisterOpen(true);
//               }}
//               onSwitchForget={() => {
//                 setIsLoginOpen(false);
//                 setIsForgetOpen(true);
//               }}
//             />
//           </div>
//         </div>
//       )}
//       {isRegisterOpen && (
//         <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
//           <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
//             <RegistrationForm
//               onClose={() => setIsRegisterOpen(false)}
//               onSwitch={() => {
//                 setIsRegisterOpen(false);
//                 setIsLoginOpen(true);
//               }}
//             />
//           </div>
//         </div>
//       )}
//       {isForgetOpen && (
//         <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
//           <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
//             <ForgetForm
//               onClose={() => setIsForgetOpen(false)}
//               onSwitch={() => {
//                 setIsForgetOpen(false);
//                 setIsLoginOpen(true);
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicPopup } from "../../features/popup/popupThunk";
import Button from "../ui/Button";
import LoginForm from "../../pages/Login";
import RegistrationForm from "../../pages/RegistrationForm";
import ForgetForm from "../../pages/ForgetForm";

export default function CouponSidebar() {
  const dispatch = useDispatch();
  const { data: popupData, loading } = useSelector((state) => state.popup);
  const [open, setOpen] = useState(false);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgetOpen, setIsForgetOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPublicPopup());
  }, [dispatch]);

  const handleSignUpNow = () => {
    const user = localStorage.getItem("user");
    if (user) {
      toast.success("You are already logged in!");
      setOpen(false);
    } else {
      setIsLoginOpen(true);
      setOpen(false);
    }
  };

  // const handleCopyCoupon = async () => {
  //   const couponCode = popupData?.coupon?.couponCode;
  const handleCopyCoupon = async () => {
    const couponCode = popupData?.coupon?.coupon?.couponCode;
    if (!couponCode) return;
    try {
      await navigator.clipboard.writeText(couponCode);
      toast.success("Coupon code copied successfully!");
    } catch (error) {
      toast.error("Failed to copy coupon code");
    }
  };

  if (
    loading ||
    !popupData?.coupon ||
    popupData.coupon.status !== "active" ||
    popupData.coupon.type !== "coupon"
  ) {
    return null;
  }
  const isCoupon = popupData.coupon.type === "coupon";
  // const coupon = popupData.coupon;
  const coupon = popupData?.coupon;
  const couponData = popupData?.coupon?.coupon;
  if (!isCoupon || !coupon) return null;

  return (
    <>
      {open && (
        <div
          className={`fixed inset-0 bg-black/40 z-[999] transition-opacity duration-300 ${
            open ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className="fixed right-0 top-1/2 z-[999] flex items-stretch transition-transform duration-500 ease-in-out"
        style={{
          transform: open
            ? "translate3d(0, -50%, 0)"
            : "translate3d(calc(100% - 25px), -50%, 0)",
        }}
      >
        <div
          onClick={() => setOpen(!open)}
          className="w-8 bg-[#282c3f] hover:bg-[#3e4152] text-white flex flex-col items-center 
                    justify-between py-6 cursor-pointer rounded-l-2xl shadow-2xl border-r border-[#3e4152]/30 select-none h-[260px] md:h-[325px]"
          style={{ alignSelf: "center" }}
        >
          <div className="flex items-center justify-center">
            {open ? (
              <svg
                className="w-4 h-4 text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-white fill-current animate-pulse"
                viewBox="0 0 24 24"
              >
                <path d="M16 5v14l-11-7z" />
              </svg>
            )}
          </div>

          <div
            className="font-bold tracking-wider text-[15px] whitespace-nowrap"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {coupon.coupon.title?.toUpperCase()}
          </div>

          <div className="h-2" />
        </div>

        <div
          className="w-[500px] max-w-[calc(100vw-60px)] bg-gradient-to-br from-[#FFF0F6] via-[#FFF8EE] to-[#FFF9F2] shadow-2xl 
                relative flex flex-col justify-between overflow-hidden border-y border-l border-pink-100"
        >
          <div className="p-2 md:p-8 flex-1 flex flex-col justify-between h-[250px] md:h-[325px]">
            <div className="flex justify-between items-start gap-6 mt-4">
              <div className="flex-1 text-left">
                <p className="text-[16px] uppercase tracking-widest text-[#7e818c] font-bold mb-1">
                  Avail Upto
                </p>

                <h2 className="text-[30px] md:text-6xl font-black text-[#3e4152] leading-none mb-5">
                  {couponData.title}
                </h2>

                <button
                  onClick={handleCopyCoupon}
                  className="inline-flex items-center gap-1.5 bg-white/70 border border-dashed border-primary rounded-lg px-3.5 py-2 hover:bg-white transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[#535766]">
                    Coupon Code:
                  </span>
                  <span className="text-sm font-extrabold text-primary tracking-wide select-all">
                    {couponData.couponCode}
                  </span>
                  <span className="text-[10px] bg-primary text-white px-2 py-1 rounded">
                    COPY
                  </span>
                </button>

                <p className="text-[16px] text-[#7e818c] mt-2 font-medium">
                  {couponData.description}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-start">
              <Button onClick={handleSignUpNow} variant="common">
                {couponData.buttonText || "SIGN UP NOW"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <LoginForm
              onClose={() => setIsLoginOpen(false)}
              onSwitchRegister={() => {
                setIsLoginOpen(false);
                setIsRegisterOpen(true);
              }}
              onSwitchForget={() => {
                setIsLoginOpen(false);
                setIsForgetOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <RegistrationForm
              onClose={() => setIsRegisterOpen(false)}
              onSwitch={() => {
                setIsRegisterOpen(false);
                setIsLoginOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {isForgetOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <ForgetForm
              onClose={() => setIsForgetOpen(false)}
              onSwitch={() => {
                setIsForgetOpen(false);
                setIsLoginOpen(true);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
