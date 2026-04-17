// SocialButtons.jsx
import React from 'react';
import { FaFacebookF } from 'react-icons/fa';
import google from "../../assets/googl.png";

const SocialButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
    <button className="flex items-stretch bg-[#3b5998] text-white rounded w-[185px] ">
      <div className="flex items-center px-2 border-r border-white">
        <FaFacebookF size={30} />
      </div>
      <div className="flex-1 flex items-center justify-center p-[13px] text-[18px]">
        Facebook
      </div>
    </button>
    <button className="flex items-stretch border light-border  bg-white  rounded w-[185px]">
      <div className="flex items-center px-2 border-r light-border">
            <img src={google}/>
      </div>
      <div className="flex-1 flex items-center justify-center p-[13px] text-[18px]">
        Google+
      </div>
    </button>

    </div>
  );
};

export default SocialButtons;
