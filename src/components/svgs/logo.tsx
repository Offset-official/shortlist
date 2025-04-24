import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width}
    height={props.height}
    fill={props.fill}
    {...props}
  >
    <path
      fill={props.fill}
      d="M20.304 25.813 7.271 48.427h12.52l13.033-22.615h-12.52ZM61.886 24.615l-7.492-13-5.829-10.113-6.26 10.863 13.32 23.113 6.261-10.863Z"
    />
    <path
      fill={props.fill}
      d="M41.006 13.115H.298L13.094 35.32l6.343-11.007 15.12.01L41.55 36.23h12.778L41.006 13.115ZM41.006 11.615 47.268.75H6.56L.298 11.615h40.708Z"
    />
    <path
      fill={props.fill}
      d="m33.087 49.177 7.162-12.197-6.121-10.425L21.09 49.178l20.354 35.32L54.24 62.293H40.787l-7.7-13.116ZM7.271 49.928 27.626 85.25h12.52l-20.36-35.322H7.271Z"
    />
    <path
      fill={props.fill}
      d="m35.267 49.928 6.38 10.865h26.835l-6.26-10.865H35.266ZM69.78 60.042l20.355-35.32-6.256-10.855-20.355 35.32 6.256 10.855ZM56.06 37.73H41.55l-6.282 10.698h26.953l20.36-35.313H56.99l6.627 11.5L56.06 37.73Z"
    />
  </svg>
)
export default SvgComponent
