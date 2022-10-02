import {forwardRef, LegacyRef} from "react"
import Link from "next/link"

import type {AnchorHTMLAttributes} from "react"


export default forwardRef(function MyLink(
  {href, children, ...rest}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {href: string},
  ref: LegacyRef<HTMLAnchorElement>
) {
  return (
    <Link href={href}>
      <a ref={ref} {...rest}>
        {children}
      </a>
    </Link>
  )
})