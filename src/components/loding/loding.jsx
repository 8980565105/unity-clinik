import React from "react";

export default function Loding({className=""}) {
  return (
    <>
      <div className={`h-screen flex justify-center items-center
        ${className}`}>
        <div className="loader"></div>
      </div>
    </>
  );
}
