import * as React from "react"

const LinearColorIcon = ({ width = 61, height = 50, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    // હવે આઇકનનું કદ પ્રોપ્સમાંથી (જેમ કે 48) મેળવશે, નહીંતર 61/50 વાપરશે.
    width={width} 
    height={height}
    fill="none"
    // viewBox ને ફેરવશો નહીં, તે આકારને નિયંત્રિત કરે છે.
    viewBox="0 0 61 50" 
    {...props}
  >
    <path fill="url(#a)" d="M0 0h61v50H20C8.954 50 0 41.046 0 30V0Z" />
    <defs>
      {/* Horizontal linear gradient definition */}
      <linearGradient
        id="a"
        x1={0}
        x2={52}
        y1={25}
        y2={25}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F43297" stopOpacity={0.8} />
         <rect x="0" y="0" width="61" height="50" fill="red" />
       <stop offset={1} stopColor="#333" />
      </linearGradient>
    </defs>
  </svg>
)
export default LinearColorIcon