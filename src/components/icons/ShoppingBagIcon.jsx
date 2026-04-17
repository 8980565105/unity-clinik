import * as React from "react"
const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 28 26"
    {...props} // This allows width/height via className or style
  >
    <path
      stroke="#000"
      strokeWidth={1.5}
      d="M19.958 3.4V2a1 1 0 0 0-1-1H9.042a1 1 0 0 0-1 1v1.4m11.916 0 6.107 1.561a1 1 0 0 1 .73 1.182l-3.415 15.67a1 1 0 0 1-.977.787h-2.445m0-19.2v19.2m0 0V24a1 1 0 0 1-1 1H9.042a1 1 0 0 1-1-1v-1.4m0-19.2L1.935 4.961a1 1 0 0 0-.73 1.182l3.415 15.67a1 1 0 0 0 .977.787h2.445m0-19.2v19.2"
    />
  </svg>
)
export default SvgComponent