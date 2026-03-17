"use client"

import { buttonVariants } from '@/components/ui/button'
import { ArrowRight, CornerUpRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'

export default function Hero () {
    return (
        <>
            <main>
                <section className="overflow-hidden">
                    <div className="relative mx-auto py-28 lg:py-10">
                        <div className="lg:flex lg:items-center lg:gap-12">
                            <div className="relative z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
                                <Link
                                    href="/"
                                    className="rounded-lg mx-auto flex w-fit items-center gap-2 border p-1 pr-3 lg:ml-0">
                                    <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs">MeetSpace</span>
                                    <span className="text-sm">Explorez nos espaces disponibles</span>
                                    <span className="bg-(--color-border) block h-4 w-px"></span>
                                    <ArrowRight className="size-4" />
                                </Link>
                                <div className="mt-8">
                                    <TextGenerateEffect duration={2} filter={false} words="MeetSpace, votre espace quand vous en avez besoin." />
                                </div>
                                <motion.p
                                    initial={{ opacity: 0, y: -50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{
                                        once: true,
                                    }}
                                    transition={{ type: "spring" }}
                                    className="mt-8"
                                >
                                    Avec MeetSpace, trouvez facilement l’espace qui vous correspond : une salle pour collaborer, un bureau pour travailler en toute tranquillité, ou un espace dédié pour vos événements.
                                </motion.p>
                                <div>
                                    <div className="my-8">
                                        <motion.div 
                                            initial={{ opacity: 0, y: -60 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{
                                                once: true,
                                            }}
                                            transition={{ type: "spring" }}
                                            className="mx-auto max-w-sm lg:my-5 lg:ml-0 lg:mr-auto"
                                        >
                                            <Link href="/sign-up" className={cn("flex items-center justify-center gap-2", buttonVariants({variant: "default"}))}>
                                                <CornerUpRight/>
                                                <span>Créer votre compte ?</span>
                                            </Link>
                                        </motion.div>
                                    </div>
                                    <motion.ul
                                        initial={{ opacity: 0, y: -80 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{
                                            once: true,
                                        }}
                                        transition={{ type: "spring" }}
                                        className="list-inside list-disc space-y-2"
                                    >
                                        Choisissez en quelques instants, réservez en un clic, et profitez d’un environnement adapté à vos besoins, en toute sérénité.
                                    </motion.ul>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 -mx-4 rounded-3xl p-3 lg:col-span-3">
                            <div aria-hidden className="absolute z-[1] inset-0 bg-gradient-to-r from-background from-35%" />
                            <div className="relative">
                                <img
                                    className="hidden dark:block"
                                    src="/assets/images/hero.jpg"
                                    alt="Hero Image"
                                    width={2796}
                                    height={2008}
                                />
                                <img
                                    className="dark:hidden"
                                    src="/assets/images/hero.jpg"
                                    alt="Hero Image"
                                    width={2796}
                                    height={2008}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}