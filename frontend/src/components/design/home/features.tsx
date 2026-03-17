"use client"

import { motion, MotionProps, Variants } from "framer-motion"
import { Calendar, Search, Star } from "lucide-react"

interface Props {
    staggerContainer?: Variants
    scaleOnHover?: MotionProps
    fadeInUp?: Variants
}

export default function Features ({
    staggerContainer,
    fadeInUp,
    scaleOnHover
}: Props) {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        Pourquoi choisir MeetSpace ?
                    </h2>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <motion.div className="text-center p-6" variants={fadeInUp}>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">
                            Recherche Intuitive
                        </h3>
                        <p className="text-muted-foreground">
                            Trouvez l'espace parfait en quelques clics grâce à notre système de recherche avancé
                        </p>
                    </motion.div>

                    <motion.div className="text-center p-6" variants={fadeInUp}>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">
                            Réservation Instantanée
                        </h3>
                        <p className="text-muted-foreground">
                            Réservez votre espace en temps réel avec confirmation immédiate
                        </p>
                    </motion.div>

                    <motion.div className="text-center p-6" variants={fadeInUp}>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">
                            Qualité Garantie
                        </h3>
                        <p className="text-muted-foreground">
                            Tous nos espaces sont soigneusement sélectionnés et régulièrement inspectés
                        </p>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    )
}