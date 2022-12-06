import { forwardRef, Ref } from "react"
import Link from "next/link"

import type { AnchorHTMLAttributes } from "react"


export default forwardRef(function MyLink(
  { href, children, ...rest }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string },
  ref: Ref<HTMLAnchorElement>
) {
  return (
    <Link ref={ref} href={href} {...rest}>
      {children}
    </Link>
  )
})