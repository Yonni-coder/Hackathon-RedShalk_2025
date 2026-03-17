"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/design/logo"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { rolesTranslations } from "@/lib/rolesTranslations"
import {toast} from "sonner"
import { useAuthStore } from "@/stores/useAuthStore"

const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().nonempty("Ce champ est requis"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Page() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isValid, isSubmitting },
    } = useForm<LoginFormValues>({
        mode: "onTouched",
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: data.email,
                    password: data.password
                }),
            })
            const result = await response.json()
            window.location.href = "/"

            if (!response.ok) {
                toast.error("Une Erreur est survenue")
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden">

            <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <Card className="shadow-2xl">
                        <CardHeader className="text-center space-y-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                            >
                                <CardTitle className="flex items-center justify-center text-3xl font-bold text-balance">
                                    <Logo />
                                </CardTitle>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                                <CardDescription className="text-muted-foreground text-balance">
                                    Connectez-vous à votre espace
                                </CardDescription>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <fieldset className="space-y-4" disabled={isSubmitting}>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email : <span className="text-sm text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Mail 
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" 
                                            />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="example: johndoe@example.com"
                                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                {...register("email")}
                                            />
                                        </div>
                                        {errors.email && 
                                            <span className="text-xs text-red-500">
                                                {errors.email.message}
                                            </span>
                                        }
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.9 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Mot de passe : <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                {...register("password")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.password && 
                                            <span className="text-xs text-red-500">
                                                {errors.password.message}
                                            </span>
                                        }
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.1 }}
                                        className="pt-2"
                                    >
                                        <Button type="submit" className="w-full group relative overflow-hidden" size="lg">
                                        <motion.span
                                            className="flex items-center justify-center gap-2"
                                            whileHover={{ x: -5 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            Connexion
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 group-hover:translate-x-1 transition-transform animate-pulse" />
                                            ) : (
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            )}
                                        </motion.span>
                                        </Button>
                                    </motion.div>
                                </fieldset>
                            </form>

                            <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="text-center text-sm text-muted-foreground"
                            >
                                <p className="text-balance">
                                    En créant un compte, vous acceptez nos conditions.{" "}
                                    <Link href="/terms" className="text-primary hover:underline">
                                    Conditions d’utilisation
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-primary hover:underline">
                                    Politique de confidentialité
                                    </Link>
                                </p>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

        </div>
    )
}
