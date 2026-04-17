// D:\mycara\frontend\src\components\icons\Battery.jsx
import * as React from "react"
const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={14}
    fill="none"
    {...props}
  >
    <rect
      width={24}
      height={12}
      x={1.172}
      y={1}
      stroke="#989696"
      opacity={0.35}
      rx={3.8}
    />
    <path
      fill="#989696"
      d="M26.672 5.281v4.076A2.212 2.212 0 0 0 28 7.319c0-.89-.523-1.693-1.328-2.038Z"
      opacity={0.4}
    />
    <rect width={21} height={9} x={2.672} y={2.5} fill="#000" rx={2.5} />
  </svg>
)
export default SvgComponent
