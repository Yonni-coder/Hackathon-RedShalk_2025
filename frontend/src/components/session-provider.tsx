"use client"

import { useEffect, useState, ReactNode } from "react"
import { Card, CardContent } from "./ui/card"
import { Loader2 } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/useAuthStore"

export default function SessionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    const checkSession = async () => {
      await isAuthenticated()
      setLoading(false)
    }
    checkSession()
  }, [isAuthenticated])

  useEffect(() => {
    const error = searchParams.get("error")
    if (error === "unauthorized") {
      toast.error("Vous devez être connecté pour accéder à cette page.")
    }
    if (error === "already_logged_in") {
      toast.info("Vous êtes déjà connecté.")
    }
    if (error === "forbidden") {
      toast.error("Accès restreint : cette section est réservée aux Gestionnaires . Si vous pensez qu’il s’agit d’une erreur, contactez l’administrateur.")
    }
  }, [pathname, searchParams])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="p-6 shadow-md rounded-2xl">
          <CardContent className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement de la session...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
