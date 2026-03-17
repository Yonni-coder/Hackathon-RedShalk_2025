import CTASection from "@/components/design/home/cta-section"
import Features from "@/components/design/home/features"
import Hero from "@/components/design/home/hero"
import SpaceCatalog from "@/components/design/home/space-catalog"

export default function Page () {

    const staggerContainer = {
        animate: {
            transition: {
            staggerChildren: 0.1,
            },
        },
    }

    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" },
    }

    const scaleOnHover = {
        whileHover: { scale: 1.05, transition: { duration: 0.2 } },
        whileTap: { scale: 0.98 },
    }


    return (
        <>
            <Hero />
            <SpaceCatalog
                staggerContainer={staggerContainer}
                fadeInUp={fadeInUp}
                scaleOnHover={scaleOnHover}
            />
            <Features
                staggerContainer={staggerContainer}
                fadeInUp={fadeInUp}
                scaleOnHover={scaleOnHover}
            />
            <CTASection
                scaleOnHover={scaleOnHover}
            />
        </>
    )
}