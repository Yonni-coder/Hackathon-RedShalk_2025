import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Logo ({className = ""}) {
    return(
        <Link href="/">
            <div className={cn("flex items-center gap-3", className)}>
                <motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true }}
  transition={{ type: "spring", stiffness: 120, damping: 15 }}
  className="flex items-center gap-3"
>
  {/* Logo avec décor animé */}
  <div className="relative flex-none">
    {/* Traits animés derrière */}
    <div className="absolute inset-0 flex items-center justify-center -z-10">
      <div className="w-12 h-12 relative">
        <span className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" />
        <span className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-secondary to-primary rounded-full rotate-45 animate-pulse delay-150" />
        <span className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-primary/70 to-secondary/70 rounded-full -rotate-45 animate-pulse delay-300" />
      </div>
    </div>

    {/* Logo container */}
    <div
  className="rounded-full p-3 shadow-lg hover:scale-110 hover:rotate-3 transition-transform duration-300"
  style={{
    background: `linear-gradient(to bottom right, var(--primary), var(--secondary))`,
  }}
>
  <img
    className="w-10 h-10"
    src="/logo.png"
    alt="Logo"
  />
</div>

  </div>

  {/* Texte branding */}
  <h1 className="text-3xl font-extrabold tracking-tight">
    <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
      Meet
    </span>
    <span className="text-slate-800 dark:text-slate-200">Space</span>
  </h1>
</motion.div>

            </div>
        </Link>
    )
}