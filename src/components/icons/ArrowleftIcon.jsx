// import * as React from "react"
// const SvgComponent = (props) => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width={11}
//     height={8}
//     fill="none"
//     {...props}
//   >
//     <path stroke="#000" d="M.291 3.842h9.71m0 0L6.422 7M10 3.842 6.423 1" />
//   </svg>
// )
// export default SvgComponent


import * as React from "react"
const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 11 8"
    fill="none"
    {...props}
  >
    <path stroke="#000" d="M10.709 4.158H.999m0 0L4.578 1M1 4.158 4.577 7" />
  </svg>
)
export default SvgComponent