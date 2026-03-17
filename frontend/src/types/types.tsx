import * as Icons from "lucide-react"

export interface FooterData {
    about: {
        title: string
        text: string
    }
    usefulLinks: {
        title: string
        links: { icon: keyof typeof Icons; label: string; href: string }[]
    }
    contact: {
        title: string
        items: { icon: keyof typeof Icons; text: string }[]
    }
    socials: {
        title: string
        links: { icon: keyof typeof Icons; label: string; href: string }[]
    }
}

export interface FooterItem {
  icon: keyof typeof Icons
  label?: string
  text?: string
  href?: string
}

export interface FooterSectionProps {
  title: string
  items: FooterItem[]
  linkMode?: boolean
}