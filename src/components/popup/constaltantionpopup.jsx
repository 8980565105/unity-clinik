import { X, Clock, Calendar, ArrowRight } from "lucide-react";
import { getImageUrl } from "../utils/helper";
import { useNavigate } from "react-router-dom";

export function ConstaltationPopup({ isOpen = true, onClose, data }) {
  const defaultData = {
    title1: "LIMITED TIME OFFER",
    title2: "HAIR EXPERT CONSULTATION",
    heading: "Book Consultation",
    buttonText: "TAP TO CONFIRM YOUR SLOT",
    image: "/uploads/derma-roller-gift.png",
    price: 499,
    offerPrice: 99,
    description: "Personalized Hair Plan, Expert Hair Analysis",
  };

  const navigate = useNavigate();

  const popupData = data || defaultData;
  const features = popupData.description
    ? popupData.description.split(",").map((item) => item.trim())
    : ["Personalized Hair Plan", "Expert Hair Analysis"];

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleBookClick = () => {
    navigate("/consultation");
  };

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="bg-[#f4faf7] w-full max-w-3xl rounded-[32px] shadow-2xl relative border border-green-200/50 flex flex-col justify-between overflow-hidden animate-scale-up">
        <div className="absolute -top-1  right-0  z-10">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-[#155e37] hover:bg-[#e4a822] border border-gray-200 flex items-center justify-center  transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            aria-label="Close popup"
          >
            <X size={18} className="text-white stroke-[2.5]" />
          </button>
        </div>
        <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-10">
          {popupData.title1 && (
            <div className="flex items-center gap-1.5 bg-[#ecf7ec] border border-[#c2e2c2] text-[#155e37] rounded-full px-3.5 py-1 text-[11px] font-black uppercase tracking-wider">
              <Clock size={12} className="stroke-[3]" />
              <span>{popupData.title1}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 md:p-8 pt-16 pb-6">
          <div className="md:col-span-7 flex flex-col justify-center text-left">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-[0.95] text-[#111]">
              HAIR EXPERT
              <span className="block text-[#155e37] mt-1">CONSULTATION</span>
            </h1>

            <div className="w-20 h-1.5 bg-[#e4a822] rounded-full mt-3 mb-6" />

            <div className="space-y-3">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 bg-white border border-gray-100 rounded-full px-5 py-3 shadow-sm hover:translate-x-1 transition-transform"
                >
                  <div className="w-7 h-7 bg-[#155e37] text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                    <span className="text-sm font-black select-none">✓</span>
                  </div>
                  <span className="text-[#222] font-black text-sm md:text-base tracking-wide">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* <div className="md:col-span-5 flex justify-center gap-4 items-center relative"> */}
          <div className="md:col-span-5 flex flex-row md:flex-col justify-center items-center gap-4 relative">
            <div className="relative transform -rotate-1 -skew-x-[12deg] shadow-lg rounded-lg overflow-hidden border border-[#c2e2c2]/50 max-w-[210px] w-full">
              <div className="bg-[#155e37] text-white px-5 py-2.5 flex flex-col items-center">
                <div className="skew-x-[12deg] text-center">
                  <span className="text-3xl font-black tracking-wider block leading-none">
                    FREE
                  </span>
                  <span className="text-[10px] font-extrabold tracking-widest block opacity-95 mt-1 uppercase">
                    DERMA ROLLER
                  </span>
                </div>
              </div>
              <div className="bg-[#e4a822] text-[#155e37] text-[10px] font-black tracking-widest text-center py-1.5 px-4 uppercase">
                <div className="skew-x-[12deg]">ONLY FOR TODAY</div>
              </div>
            </div>

            <div className="mt-4 w-[180px] flex items-center justify-center min-h-[120px]">
              <img
                src={getImageUrl(popupData.image)}
                alt="Free Derma Roller Gift"
                className="w-full md:w-[220px] object-contain hover:scale-105 transition-transform duration-300 filter drop-shadow-md"
              />
            </div>
          </div>
        </div>

        <div
          onClick={handleBookClick}
          className="bg-gradient-to-r from-[#114b2b] to-[#165e37] p-4 md:p-5 flex items-center justify-between text-white border-t border-[#1a6e42] cursor-pointer hover:from-[#0d3c22] hover:to-[#124d2d] transition-all duration-300 group rounded-b-[30px]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 border border-white/20 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
              <Calendar size={22} className="text-[#8fcca2] stroke-[2]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg md:text-xl font-black uppercase tracking-wide leading-tight group-hover:text-[#8fcca2] transition-colors">
                {popupData.heading}
              </span>
              <span className="text-[#8fcca2] text-[10px] font-extrabold uppercase tracking-widest mt-0.5 opacity-90">
                {popupData.buttonText}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              {popupData.price !== undefined && (
                <span className="text-xs text-white/40 line-through font-bold tracking-wider leading-none mb-0.5">
                  ₹{popupData.price}
                </span>
              )}
              {popupData.offerPrice !== undefined && (
                <span className="text-2xl md:text-3xl font-black text-[#e4a822] leading-none">
                  ₹{popupData.offerPrice}
                </span>
              )}
            </div>

            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center border border-white/20 group-hover:bg-[#e4a822] group-hover:border-[#e4a822] group-hover:text-[#155e37] transition-all duration-300">
              <ArrowRight size={18} className="stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
