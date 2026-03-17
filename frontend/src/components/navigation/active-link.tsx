"use client"

import { usePathname } from "next/navigation"
import { PropsWithChildren, useMemo } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"

interface Props {
  href: string
}

export default function ActiveLink({ href, children }: PropsWithChildren<Props>) {
    const pathname = usePathname()
    const isActive = useMemo((): boolean => 
        pathname === href || pathname.startsWith(href + '/'), 
        [pathname, href]
    )
    return (
        <Link href={href} className={cn(isActive ? "text-primary" : "text-foreground")}>
            <motion.span
                whileHover={{ scale: 1.05 }}
                className={cn(
                "flex items-center space-x-2 hover:text-primary transition-colors duration-200"
                )}
            >
                {children}
            </motion.span>
        </Link>
    )
}
