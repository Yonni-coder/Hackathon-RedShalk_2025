import * as Icons from "lucide-react"
import { ReactNode } from "react"
import { FooterSectionProps } from "@/types/types"
import Links from "./links"

export default function FooterSection({ title, items, linkMode = false }: FooterSectionProps) {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <h2 className="text-md font-bold text-primary">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, index) => {
          const Icon = Icons[item.icon]
          const content: ReactNode = (
            <>
              {Icon && <Icon size={16} />}
              <span>{item.label || item.text}</span>
            </>
          )
          return (
            <li key={index} className="flex items-center gap-2">
              {linkMode && item.href ? (
                <Links href={item.href} variant="secondary" className="flex items-center gap-2">
                  {content}
                </Links>
              ) : (
                <div className="flex items-center gap-2">{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
