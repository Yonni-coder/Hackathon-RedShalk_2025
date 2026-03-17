"use client"

import { Button } from "@/components/ui/button"
import { motion, MotionProps } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function CTASection ({ scaleOnHover }: { scaleOnHover: MotionProps }) {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <motion.div
                    className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-center text-white"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                        Prêt à transformer votre façon de travailler ?
                    </h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Rejoignez des milliers d'utilisateurs qui font confiance à MeetSpace pour leurs espaces de travail
                    </p>
                    <motion.div {...scaleOnHover}>
                        <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                            Commencer maintenant
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}