import * as React from "react"
const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={18}
    fill="none"
    {...props}
  >
    <path
      stroke="#F43297"
      strokeWidth={2}
      d="M0 9.203h20m0 0-5.644 7.556M20 9.203 14.356.76"
    />
  </svg>
)
export default SvgComponent
