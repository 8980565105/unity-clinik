import React from 'react';
import { Link } from 'react-router-dom';
import orderImg from "../../assets/orders.png"
import addressImg from "../../assets/address.png"
import accountImg from "../../assets/account-details.png"

const cards = [
  {
    title: "Your Orders",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    image: orderImg,
    link: "/my-account/orders",
  },
  {
    title: "Your Addresses",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    image: addressImg,
    link: "/my-account/address",
  },
  {
    title: "Account Details",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    image: accountImg,
    link: "/my-account/account-details",
  },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
      {cards.map((card, index) => (
        <Link
          key={index}
          to={card.link}
          className="bg-white px-[42px] py-[35px] box-shadow  transition flex flex-col items-center text-center"
        >
          <div className="flex justify-center items-center mb-[32px]">
            <img src={card.image} alt={`${card.title} Icon`} className="w-[90px] h-[90px]" />
          </div>
          <h3 className="text-[24px] leading font-medium mb-[17px]">{card.title}</h3>
          <p className="text-14 text-light">{card.description}</p>
        </Link>
      ))}
    </div>
  );
}
