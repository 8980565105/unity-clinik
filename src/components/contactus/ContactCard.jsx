import React from "react";
import FlowerIcon from "../icons/FlowerIcon";

const ContactCard = ({ icon, title, description, linkText, linkHref }) => {
  return (
    <div className="relative border-2 border-dashed border-[var(--primary-color)] py-[29px] px-[21px] rounded-lg transition flex items-start gap-[20px] bg-white">
      <FlowerIcon className="absolute -top-5 -left-5 sm:-left-6 w-[40px] sm:w-[50px] h-[40px] text-pink-300 pointer-events-none" />

      <div className=" p-[10px] bg-color-100 w-[50px] h-[50px] rounded-[10px]">
        <span className="w-[30px] h-[30px] inline-flex items-center justify-center text-xl text-white">
          {icon}
        </span>
      </div>
      <div className="text-left flex-1">
        <h3 className="text-dark text-20px font-semibold mb-[7px] leading">
          {title}
        </h3>

        <div className="flex flex-col justify-between items-start h-[90px] custom-lg:min-h-[82px] md:min-h-[135px]  ">
          <p className="text-[#989696] text-14 break">{description}</p>
          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme font-medium underline text-left break "
          >
            {linkText}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
