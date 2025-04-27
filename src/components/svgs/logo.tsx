import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 600 600"
    className={props.className}
    {...props}
  >
    <path
      className={props.className}
      d="M600 73.19 251 346l-115.5-79L39 337.5 179.5 545 600 298.517V600H0V0h600v73.19Z"
    />
  </svg>
)
export default SvgComponent
