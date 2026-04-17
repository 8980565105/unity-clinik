import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import delivery from "../../assets/delivery.png";
import exchange from "../../assets/exchange.png";
import cod from "../../assets/cod.png";

function PrevArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute left-0 top-1/2 -translate-y-1/2  -translate-x-[150%] z-10"
    >
      <ChevronLeft size={20} />
    </button>
  );
}

function NextArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-0 top-1/2 -translate-y-1/2  translate-x-[150%] z-10"
    >
      <ChevronRight size={20} />
    </button>
  );
}

export default function DeliveryInfo() {
  const deliveryItems = [
    {
      icon: cod,
      title: (
       <>
          COD <span className="font-medium">available</span>
        </>
      ),
      subtitle: "Know More",
    },
    {
      icon: exchange,
      title: (
       <>
          7-day return <span className="font-medium">&</span> size exchange 
        </>
      ),
      subtitle: "Know More",
    },
    {
      icon: delivery,
      title: (
       <>
          Usally ships in <span className="font-medium">1 day</span>
        </>
      ),
      subtitle: "Know More",
    },
    {
      icon: exchange,
      title: (
       <>
          7-day return <span className="font-medium">&</span> size exchange 
        </>
      ),
      subtitle: "Know More",
    },
  ];

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sliderSettings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    // slidesToShow: 3, 
    slidesToShow: windowWidth <= 480 ? 1 : windowWidth <= 767 ? 2 :  windowWidth <= 1280 ? 3 : 3, 
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    
  };

  return (
    <>
      <h4 className="text-[24px] pb-[20px] leading">Select Delivery Location</h4>
      <p className="text-14 text-light pb-[10px]">
        Enter your pincode to check product availability and delivery options.
      </p>
      <div className="flex input-common justify-between bg-[rgba(152,152,150,0.1)] !rounded-none">
        <input
          type="text"
          placeholder="Enter Pincode"
          className="w-full focus:outline-none bg-transparent"
        />
        <button className="text-[#BCBCBC] text-14">Apply</button>
      </div>

      <div className="pt-6 mx-[2rem]">
        <Slider {...sliderSettings}>
          {deliveryItems.map((item, index) => (
            <div key={index} className="!w-full px-2">
              <div className="flex flex-col  bg-white p-4 rounded-md text-left h-full">
                <div className="mb-[15px] h-[40px] ">
                  <img src={item.icon} alt="" className="max-h-[30px]" />
                </div>
                <div className="flex flex-col justify-between h-[120px]">
                  <p className="text-20px font-light">{item.title}</p>
                  <p className="text-p text-theme">{item.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

    </>
  );
}
