"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useInView } from "react-intersection-observer"
import { motion, MotionProps, Variants } from "framer-motion"
import { Users, Star } from "lucide-react"
import { useEffect, useState } from "react"

interface Props {
    staggerContainer?: Variants
    scaleOnHover?: MotionProps
    fadeInUp?: Variants
}

function SpacesCatalogSkeleton () {
    return (
        Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="overflow-hidden rounded-xl border bg-card">
                <Skeleton className="w-full h-48 bg-muted" />

                <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />

                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 bg-muted rounded-full" />
                        <Skeleton className="h-6 w-20 bg-muted rounded-full" />
                    </div>

                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-24 bg-muted" />
                        <Skeleton className="h-10 w-24 bg-muted rounded-lg" />
                    </div>
                </div>
            </div>
        ))
    )
}

export default function SpaceCatalog ({
    staggerContainer,
    scaleOnHover,
    fadeInUp
}: Props) {

    const [spaces, setSpaces] = useState([])
    const [loading, setLoading] = useState(true)

    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

    useEffect(() => {
        async function fetchSpaces() {
            try {
                const res = await fetch("/spaces.json")
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const json = (await res.json())
                setSpaces(json)
            } finally {
                setLoading(false)
            }
        }

        if (inView) {
            fetchSpaces()
        }
    }, [inView, setSpaces])

    console.log(spaces)

    return (
        <section className="py-20">
            <div className="container mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Catalogue de nos espaces
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Découvrez notre sélection d'espaces soigneusement choisis pour répondre à tous vos besoins professionnels
                    </p>
                </motion.div>
                <div ref={ref}>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <SpacesCatalogSkeleton />
                        </div>
                    ) : (
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            // variants={staggerContainer}
                            // initial="initial"
                            // whileInView="animate"
                            //viewport={{ once: true }}
                        >
                            {spaces.map((space, index) => (
                                <motion.div key={index} variants={fadeInUp} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
                                    <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow duration-300">
                                        <div className="relative">
                                            <img
                                                src={space.image || "/placeholder.svg"}
                                                alt={space.name}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <Badge variant={space.available ? "default" : "secondary"}>
                                                    {space.available ? "Disponible" : "Occupé"}
                                                </Badge>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <Badge variant="outline" className="bg-background/80">
                                                    {space.type}
                                                </Badge>
                                            </div>
                                        </div>

                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg mb-2">
                                                    {space.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    {space.capacity}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">
                                                    {space.rating}
                                                </span>
                                            </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {space.features.map((feature, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-2xl font-bold text-primary">
                                                            {space.price}
                                                        </span>
                                                    </div>
                                                    <motion.div {...scaleOnHover}>
                                                        <Button disabled={!space.available} className="w-full sm:w-auto">
                                                            {space.available ? "Réserver" : "Indisponible"}
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
      </section>
    )
}