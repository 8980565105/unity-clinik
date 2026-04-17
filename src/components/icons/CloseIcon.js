import * as React from "react"

const CloseIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={8}
    height={8}
    fill="none"
    viewBox="0 0 8 8"
    {...props}
  >
    <path
      stroke="#ffffff"
      strokeWidth={1.5}
      d="M1 1L7 7M7 1L1 7"
    />
  </svg>
)

export default CloseIcon
