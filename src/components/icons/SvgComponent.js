// D:\mycara\frontend\src\components\icons\SvgComponent.js
import * as React from "react";

const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    {...props}
  >
    <path
      fill="#000"
      fillOpacity={0.7}
      d="M15.234 3.749h-13.5a.984.984 0 0 0-.984.984v9a.984.984 0 0 0 .984.985h13.5a.985.985 0 0 0 .985-.985v-9a.985.985 0 0 0-.985-.984Zm-13.5.844h13.5a.14.14 0 0 1 .141.14v1.5H1.594v-1.5a.14.14 0 0 1 .14-.14Zm13.5 9.281h-13.5a.14.14 0 0 1-.14-.14V7.076h13.781v6.656a.14.14 0 0 1-.14.141Z"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeOpacity={0.7}
      d="M3.003 8.158h3.314M3.003 9.503h3.314M3.003 8.158c.71-.016 2.367 0 2.367 1.42s-1.657 1.404-2.367 1.42"
    />
    <path
      fill="#000"
      fillOpacity={0.7}
      d="M5.37 13.42a.375.375 0 0 0 .474-.581l-.475.58Zm-2.604-2.131 2.603 2.13.475-.58-2.603-2.13-.475.58Z"
    />
  </svg>
);

export default SvgComponent;
