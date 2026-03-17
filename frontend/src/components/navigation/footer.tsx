"use client"

import {Button} from "@/components/ui/button"
import { useEffect, useState } from "react"
import { FooterData } from "@/types/types"
import { ChevronUp } from "lucide-react"
import { getFooterData } from "@/lib/getData"
import Logo from "../design/logo"
import FooterSection from "./section/footer-section"

export default function Footer() {
    
    const [data, setData] = useState<FooterData | null>(null)

    useEffect(() => {
        getFooterData()
            .then(setData)
            .catch(console.error)
    }, [])

    if (!data) return null
    
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <>
            <footer className="border-t border-neutral-300 dark:border-neutral-800">
                <div className="flex flex-col space-y-10 px-5 py-10 md:px-[10%]">
                    <div className="flex justify-between items-center">
                        <Logo />
                        <div>
                            <Button variant="secondary" onClick={scrollToTop}>
                                <ChevronUp/>
                            </Button>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="flex flex-col space-y-4 w-full">
                            <h2 className="text-md font-bold text-primary">
                                {data.about.title}
                            </h2>
                            <p>
                                {data.about.text}
                            </p>
                        </div>
                        <div className="w-full">
                            <FooterSection
                                title={data.usefulLinks.title}
                                items={data.usefulLinks.links}
                                linkMode
                            />
                        </div>
                        <div className="w-full">
                            <FooterSection
                                title={data.socials.title}
                                items={data.socials.links}
                                linkMode
                            />
                        </div>
                        <div className="w-full">
                            <FooterSection
                                title={data.contact.title}
                                items={data.contact.items}
                            />
                        </div>
                    </div>
                </div>
            </footer>
            <div className="border-t border-neutral-300 dark:border-neutral-800">
                <div className="flex max-500:flex-col items-center justify-between px-5 py-5 md:px-[10%]">
                    <span className="text-lg font-bold">
                        a'Rafitra
                    </span>
                    <p>
                        &copy; {new Date().getFullYear()} a'Rafitra. Tous droits réservés.
                    </p>
                </div>
            </div>
        </>
    )
}
