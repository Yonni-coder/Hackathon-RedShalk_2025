import { cn } from "@/lib/utils"
import { LinksProps } from "@/types/types"
import Link from "next/link"
import { PropsWithChildren } from "react"

export default function Links({href, variant = "primary", className, children}: PropsWithChildren<LinksProps>) {
    let variantStyles: string = ""
    switch (variant) {
        case "primary":
            variantStyles = "text-primary"
            break
        case "secondary":
            variantStyles = ""
            break
    }
    return(
        <div>
            <Link href={href} className={cn("text-sm hover:underline transition-all", variantStyles, className)}>
                {children}
            </Link>
        </div>
    )
}