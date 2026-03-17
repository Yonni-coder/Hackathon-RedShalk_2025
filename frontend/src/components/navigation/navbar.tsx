"use client"

import { AnimatePresence, motion } from "framer-motion"
import Logo from "../design/logo"
import ActiveLink from "./active-link"
import { Bell, Building2, Calendar, ChevronDown, Eye, Gift, Home, Loader2, LogOut, Menu, ShoppingCart, User, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button, buttonVariants } from "../ui/button"
import { useEffect, useState } from "react"
import ToggleTheme from "./toggle-theme"
import Link from "next/link"
import { size } from "zod"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/useAuthStore"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { usePathname } from "next/navigation"
import useRoomsStore from "@/stores/roomsStore"
import { useCartStore } from "@/stores/cartStore"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
 
export default function Navbar () {
    const [isOpen, setIsOpen] = useState(false)
    const { user, logout, isAuthenticated } = useAuthStore()
    const { items } = useCartStore()
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()
    const toggleMenu = () => setIsOpen(!isOpen)

    const handleLogout = async () => {
        try {
            setLoading(true)
            await logout()
            window.location.href = "/"
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full sticky border-b border-neutral-300 dark:border-neutral-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-white top-0 left-0 z-90 px-5 md:px-[10%] py-2"
        >
            <div className="w-full flex justify-between items-center h-14">

                <div className="flex items-center gap-6">
                    <Logo />
                    <div className="md:mt-1 hidden md:flex items-center space-x-6">
                        <ActiveLink
                            href="/"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Accueil
                        </ActiveLink>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200"
                                >
                                    <Gift className="h-4 w-4" />
                                    <span>Offres</span>
                                    <ChevronDown className="h-4 w-4" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <AnimatePresence>
                                <DropdownMenuContent asChild className="w-48 bg-popover border border-border shadow-lg">
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <DropdownMenuItem className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Réservation</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground">
                                            <Eye className="h-4 w-4" />
                                            <span>Voir les offres</span>
                                        </DropdownMenuItem>
                                    </motion.div>
                                </DropdownMenuContent>
                            </AnimatePresence>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className={cn("flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200", pathname === "/ressources" && "text-primary")}
                                >
                                    <Building2 className="h-4 w-4" />
                                    <span>Salles</span>
                                    <ChevronDown className="h-4 w-4" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <AnimatePresence>
                                <DropdownMenuContent asChild className="w-48 bg-popover border border-border shadow-lg">
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <DropdownMenuItem className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Réservation</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground">
                                            <Link href="/ressources" className="flex items-center space-x-2">
                                                <Eye className="h-4 w-4" />
                                                <span>Voir les salles</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </motion.div>
                                </DropdownMenuContent>
                            </AnimatePresence>
                        </DropdownMenu>

                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div>
                        <div className="md:hidden">
                            <Button 
                                variant="outline"
                                size="icon" 
                                onClick={toggleMenu} 
                                className="rounded-xl px-4 py-2 transition-colors duration-300"
                            >
                                {isOpen 
                                    ? <X className="h-6 w-6" /> 
                                    : <Menu className="h-6 w-6" />
                                }
                            </Button>
                        </div>
                    </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                        <Link
                            href="/checkout"
                            className={cn(
                            buttonVariants({ variant: "outline", size: "icon" }),
                            "rounded-xl px-4 py-2 transition-colors duration-300"
                            )}
                        >
                            <ShoppingCart />

                            {/* 🟢 Badge */}
                            {items.length > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5"
                            >
                                {items.length}
                            </motion.span>
                            )}
                        </Link>
                        </motion.div>
                    {isAuthenticated && user ? (
                        <>
                            
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Avatar className="w-10 h-10 cursor-pointer">
                                        <AvatarImage
                                            src="/assets/images/30.png"
                                            alt="usere"
                                        />
                                        <AvatarFallback className="bg-secondary text-md font-bold">
                                            {user.fullname.substr()}
                                        </AvatarFallback>
                                    </Avatar>
                                </SheetTrigger>
                                <SheetContent
                                    side="right"
                                    className="w-64 border-l-2 border-neutral-400 dark:border-neutral-800 p-0"
                                >
                                    <SheetHeader className="p-4 border-b">
                                        <SheetTitle>
                                            @{user.fullname.toLowerCase()}
                                        </SheetTitle>
                                    </SheetHeader>

                                    <nav className="flex flex-col p-4">
                                        <button
                                            onClick={handleLogout}
                                            disabled={loading}
                                            className="w-full p-2 rounded-lg flex items-center gap-2 hover:bg-secondary transition-all outline-none"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 animate-pulse" />
                                            ) : (
                                                <LogOut className="w-4 h-4" />
                                            )}
                                            {loading ? "Déconnexion..." : "Déconnexion"}
                                        </button>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </>
                    ) : (
                        <motion.div 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                        >
                        <Link 
                            href="/sign-in"
                            className={cn(
                                buttonVariants({
                                variant: "outline",
                                size: "icon"
                            }), "rounded-xl px-4 py-2 transition-colors duration-300")}
                        >
                            <User  />
                        </Link>
                    </motion.div>
                    )}
                    <ToggleTheme />
                </div>

            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden border-t border-border"
                    >
                        <div className="py-4 space-y-4">
                            <ActiveLink
                                href="/"
                            >
                                <Home className="h-4 w-4" />
                                <span>Accueil</span>
                            </ActiveLink>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-foreground font-medium">
                                    <Gift className="h-4 w-4" />
                                    <span>Offres</span>
                                </div>
                                <motion.a
                                    href="/reservation"
                                    whileHover={{ x: 10 }}
                                    className="flex items-center space-x-2 ml-6 text-muted-foreground hover:text-accent transition-colors duration-200"
                                >
                                    <Calendar className="h-4 w-4" />
                                    <span>Réservation</span>
                                </motion.a>
                                <motion.a
                                    href="/offres"
                                    whileHover={{ x: 10 }}
                                    className="flex items-center space-x-2 ml-6 text-muted-foreground hover:text-accent transition-colors duration-200"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>Voir les offres</span>
                                </motion.a>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-foreground font-medium">
                                    <Building2 className="h-4 w-4" />
                                    <span>Salles</span>
                                </div>
                                <motion.a
                                    href="/salles/reservation"
                                    whileHover={{ x: 10 }}
                                    className="flex items-center space-x-2 ml-6 text-muted-foreground hover:text-accent transition-colors duration-200"
                                >
                                    <Calendar className="h-4 w-4" />
                                    <span>Réservation</span>
                                </motion.a>
                                <motion.a
                                    href="/salles"
                                    whileHover={{ x: 10 }}
                                    className="flex items-center space-x-2 ml-6 text-muted-foreground hover:text-accent transition-colors duration-200"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>Voir les salles</span>
                                </motion.a>
                            </div>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                                <User className="h-4 w-4 mr-2" />
                                Connexion
                            </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}