import {forwardRef, LegacyRef} from "react"
import Link from "next/link"

import type {AnchorHTMLAttributes, ReactNode} from "react"


export default forwardRef(function MyLink({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
},
ref: LegacyRef<HTMLAnchorElement>) {
  return (
    <Link href={href}>
      <a ref={ref} {...rest}>
        {children}
      </a>
    </Link>
  )
})