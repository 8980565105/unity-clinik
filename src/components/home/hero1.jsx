import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaHeart, FaStar, FaGoogle } from "react-icons/fa";
import { getImageUrl } from "../utils/helper";
import Button from "../ui/Button";
import a1 from "../../assets/a1.png";
import a2 from "../../assets/a2.webp";
import a3 from "../../assets/a3.png";
import d1 from "../../assets/d1.webp";
import d2 from "../../assets/d2.webp";
import d4 from "../../assets/d4.webp";
import be2 from "../../assets/be2.webp";
import d6 from "../../assets/d6.webp";
import { Star } from "lucide-react";

export default function Hero1() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const slides = [
    {
      title: "Grade 6 had me worried...now my confidence is back",
      description:
        "I was really worried about Grade 6 hair loss. Treatment ke baad amazing results mile...",
      button: "Shop Now",
      link: "/shop",
      location: "Punjab, IN",
      user: {
        name: "Sunny",
        age: 36,
        review:
          "I was really worried about Grade 6 hair loss. Treatment ke baad amazing results mile...",
      },
      images: {
        main: d2,
        before: be2,
        after: a2,
      },
    },
    {
      title: "Hair fall control treatment",
      description:
        "I was really worried about Grade 6 hair loss. Treatment ke baad amazing results mile...",
      button: "Explore",
      link: "/contact-us",

      location: "Delhi, IN",
      user: {
        name: "Rahul",
        age: 32,
        review:
          "Hair fall control treatment worked really well. Confidence is back.",
      },
      images: {
        main: d4,
        before: d1,
        after: d6,
      },
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    appendDots: (dots) => <ul className="flex justify-center gap-3">{dots}</ul>,
    customPaging: () => (
      <div className="w-[40px] h-[3px] bg-white/50 rounded-full transition-all duration-300 slick-dot-bar" />
    ),
  };

  return (
    <>
      <Slider {...settings} className="w-full">
        {slides.map((slide, index) => (
          <div key={index}>
            <div className="hidden lg:block relative h-[800px] w-full overflow-hidden">
              <div
                className="absolute w-full h-full bg-primary 
                [clip-path:polygon(100%_0%,100%_60%,0%_52%,0%_0%)]"
              />
              <div
                className="absolute w-full h-full bg-[#e0dedc] 
                [clip-path:polygon(100%_100%,100%_60%,0%_52%,0%_100%)]"
              />
              <div className="relative z-10 flex items-center justify-between h-full px-20">
                <div className="text-left flex flex-col justify-between h-full max-w-[700px] py-[30px] mb-10">
                  <div className="text-white">
                    <p className="mt-5 text-[20px] uppercase">
                      HAIR GROWTH TREATMENT BY DOCTORS
                    </p>
                    <h1 className="text-[50px] font-bold leading-none my-5">
                      {slide.title}
                    </h1>
                    <p className="text-white text-[18px] mb-10">
                      {slide.description}
                    </p>
                    <Button
                      onClick={() => navigate(slide.link)}
                      variant="commone"
                      className="!bg-white !text-primary rounded-full min-w-[150px]"
                    >
                      {slide.button}
                    </Button>
                  </div>
                  <div className="flex gap-6 justify-center items-center">
                    <div className="w-[180px] h-[180px] rounded-2xl bg-white/60 backdrop-blur-md shadow-md flex flex-col items-center justify-center relative">
                      <h2 className="text-3xl font-bold text-gray-800">1L+</h2>
                      <p className="text-gray-600 mt-1">Customers</p>
                      <div className="absolute -bottom-5 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow">
                        <FaHeart className="text-red-400 text-xl" />
                      </div>
                    </div>
                    <div className="w-[180px] h-[180px] rounded-2xl bg-white/60 backdrop-blur-md shadow-md flex flex-col items-center justify-center relative">
                      <h2 className="text-3xl font-bold text-gray-800">95%</h2>
                      <p className="text-gray-600 mt-1">Saw results*</p>
                      <div className="absolute -bottom-5 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow">
                        <FaStar className="text-yellow-400 text-xl" />
                      </div>
                    </div>
                    <div className="w-[180px] h-[180px] rounded-2xl bg-white/60 backdrop-blur-md shadow-md flex flex-col items-center justify-center relative">
                      <h2 className="text-3xl font-bold text-gray-800">4.8</h2>
                      <p className="text-gray-600 mt-1">Ratings</p>
                      <div className="absolute -bottom-5 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow">
                        <FaGoogle className="text-red-500 text-xl" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-[420px] h-[500px]">
                  <div className="z-20 absolute top-3 right-3 text-[40px] text-white">
                    {slide.location}
                  </div>
                  <div className="relative w-[420px] h-[500px] flex justify-center">
                    <div className="absolute -top-[74px] right-55 w-[260px] h-[500px] z-10">
                      <img
                        src={slide.images.main}
                        alt=""
                        className="w-[260px] h-[400px] object-cover"
                      />
                    </div>
                    <div className="absolute bottom-10 z-20 left-0 w-[180px] h-[200px] rounded-xl shadow-md">
                      <div className="relative">
                        <img
                          src={slide.images.before}
                          alt=""
                          className="w-[180px] h-[200px] object-cover"
                        />
                        <p className="absolute bottom-[2%] text-white uppercase left-[50%]">
                          before
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-10 z-20 right-0 w-[180px] h-[200px] rounded-xl shadow-md">
                      <div className="relative">
                        <img
                          src={slide.images.after}
                          alt=""
                          className="w-[180px] h-[200px] object-cover"
                        />
                        <p className="absolute bottom-[2%] text-white uppercase left-[50%]">
                          After
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="z-10">
                    <div className="flex gap-1 items-center">
                      <span className="font-bold text-[20px]">
                        {slide.user.name},
                      </span>
                      <span className="text-[20px]">Age {slide.user.age}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-yellow-400"
                            size={20}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-left line-clamp-3">
                      {slide.user.review}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="block lg:hidden mx-2 my-2">
              <div
                className="rounded-[20px] overflow-hidden"
                style={{ background: "#1d3144" }}
              >
                <div className="flex flex-row items-start gap-3 p-3 pb-0 relative z-10">
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <div className="relative w-[115px] h-[108px] rounded-[12px] overflow-hidden shadow-lg">
                      <img
                        src={slide.images.before}
                        alt="before"
                        className="w-full h-full object-cover"
                      />
                      <span
                        className="absolute bottom-[6px] left-[8px] text-white text-[10px] font-bold uppercase tracking-wider"
                        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                      >
                        Before
                      </span>
                    </div>
                    <div className="relative w-[115px] h-[108px] rounded-[12px] overflow-hidden shadow-lg">
                      <img
                        src={slide.images.after}
                        alt="before2"
                        className="w-full h-full object-cover"
                      />
                      <span
                        className="absolute bottom-[6px] left-[8px] text-white text-[10px] font-bold uppercase tracking-wider"
                        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                      >
                        Before
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-[5px] pt-1">
                    <div className="text-white">
                      <p className="mt-5 text-[20px] uppercase">
                        HAIR GROWTH TREATMENT BY DOCTORS
                      </p>
                      <h1 className="text-[24px] font-bold leading-none my-5">
                        {slide.title}
                      </h1>
                      <Button
                        variant="commone"
                        className="!bg-white !text-primary rounded-full min-w-[150px]"
                      >
                        {slide.button}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="relative w-full mt-[-6px]">
                  <img
                    src={slide.images.main}
                    alt="main"
                    className="w-full object-contain object-top"
                    style={{ height: "340px" }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-10"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.2), transparent)",
                    }}
                  />
                </div>
                <div className="flex bg-white rounded-b-[20px] border-b">
                  {[
                    {
                      val: "1L+",
                      label: "Customers",
                      icon: <FaHeart className="text-red-400" size={17} />,
                    },
                    {
                      val: "95%",
                      label: "Saw results*",
                      icon: <FaStar className="text-yellow-400" size={17} />,
                    },
                    {
                      val: "4.8",
                      label: "Ratings",
                      icon: <FaGoogle className="text-blue-500" size={17} />,
                    },
                  ].map((s, i, arr) => (
                    <div
                      key={s.label}
                      className={`flex-1 flex flex-col items-center py-4 gap-[3px] ${
                        i < arr.length - 1 ? "border-r border-gray-200" : ""
                      }`}
                    >
                      <span className="text-[22px] font-extrabold text-gray-800 leading-none">
                        {s.val}
                      </span>
                      <span className="text-[11px] text-gray-500 leading-none">
                        {s.label}
                      </span>
                      <span className="mt-[3px]">{s.icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </>
  );
}
