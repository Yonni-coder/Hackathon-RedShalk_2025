"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CreditCard, Lock, Calendar, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { PaymentSkeleton } from "@/components/payment-skeleton"
import { jsPDF } from "jspdf"

// helper pour formater montant en chaîne lisible
const formatMoney = (value: number | string) =>
  typeof value === "number" ? value.toLocaleString("fr-FR") : parseFloat(value).toLocaleString("fr-FR")

// Génère et télécharge le PDF
const generateReceiptPdf = (booking: {
  bookingId: string
  customer: { email?: string; firstName?: string; lastName?: string; company?: string; phone?: string }
  items: {
    id: string
    roomName: string
    date: string
    startTime: string
    endTime: string
    duration: number
    price: number
  }[]
  total: number
  paymentMethod: string
  transactionId?: string
  paymentDate: string
}) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 40

  // Header
  doc.setFontSize(18)
  doc.text("REÇU DE PAIEMENT", pageWidth / 2, y, { align: "center" })
  y += 28

  // Booking meta
  doc.setFontSize(10)
  doc.text(`Référence : ${booking.bookingId}`, 40, y)
  doc.text(`Date : ${new Date(booking.paymentDate).toLocaleString("fr-FR")}`, pageWidth - 200, y)
  y += 18

  // Client
  doc.setFontSize(11)
  doc.text("Client :", 40, y)
  const clientLine = `${booking.customer.firstName || ""} ${booking.customer.lastName || ""}`.trim()
  doc.text(clientLine || booking.customer.email || "-", 110, y)
  y += 16
  if (booking.customer.company) {
    doc.text(`Entreprise: ${booking.customer.company}`, 110, y)
    y += 16
  }
  if (booking.customer.phone) {
    doc.text(`Téléphone: ${booking.customer.phone}`, 110, y)
    y += 16
  }
  y += 8

  // Table header
  doc.setDrawColor(200)
  doc.setLineWidth(0.5)
  const tableX = 40
  const colWidths = { item: 180, date: 80, time: 120, duration: 60, price: 80, total: 80 }
  doc.setFontSize(10)
  doc.text("Produit / Salle", tableX, y)
  doc.text("Date", tableX + colWidths.item, y)
  doc.text("Horaire", tableX + colWidths.item + colWidths.date, y)
  doc.text("Durée", tableX + colWidths.item + colWidths.date + colWidths.time, y)
  doc.text("Prix/h", tableX + colWidths.item + colWidths.date + colWidths.time + colWidths.duration, y, { align: "right" })
  doc.text("Total", pageWidth - 40, y, { align: "right" })
  y += 8
  doc.line(tableX, y, pageWidth - 40, y)
  y += 12

  // Items
  booking.items.forEach((it) => {
    const totalLine = it.price * it.duration
    doc.setFontSize(10)
    doc.text(it.roomName, tableX, y, { maxWidth: colWidths.item })
    doc.text(new Date(it.date).toLocaleDateString("fr-FR"), tableX + colWidths.item, y)
    doc.text(`${it.startTime} - ${it.endTime}`, tableX + colWidths.item + colWidths.date, y)
    doc.text(`${it.duration}h`, tableX + colWidths.item + colWidths.date + colWidths.time, y)
    doc.text(formatMoney(it.price), tableX + colWidths.item + colWidths.date + colWidths.time + colWidths.duration + 10, y, { align: "right" })
    doc.text(formatMoney(totalLine), pageWidth - 40, y, { align: "right" })
    y += 16

    // si la page est presque pleine, nouvelle page
    if (y > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage()
      y = 40
    }
  })

  y += 12
  doc.line(tableX, y, pageWidth - 40, y)
  y += 18

  // Totaux
  const tva = Math.round(booking.total * 0.2)
  const totalTTC = Math.round(booking.total * 1.2)
  doc.setFontSize(11)
  doc.text("Sous-total", pageWidth - 200, y)
  doc.text(formatMoney(booking.total.toFixed ? booking.total.toFixed(0) : String(booking.total)), pageWidth - 40, y, { align: "right" })
  y += 16
  doc.text("TVA (20%)", pageWidth - 200, y)
  doc.text(formatMoney(String(tva)), pageWidth - 40, y, { align: "right" })
  y += 16
  doc.setFontSize(13)
  doc.text("Total TTC", pageWidth - 200, y)
  doc.text(formatMoney(String(totalTTC)), pageWidth - 40, y, { align: "right" })
  y += 28

  // Paiement info
  doc.setFontSize(10)
  doc.text(`Moyen de paiement : ${booking.paymentMethod}`, 40, y)
  if (booking.transactionId) {
    doc.text(`ID Transaction : ${booking.transactionId}`, 40, y + 16)
    y += 16
  }

  // Pied de page / signature
  doc.setFontSize(10)
  doc.text("Merci pour votre paiement.", 40, doc.internal.pageSize.getHeight() - 60)
  doc.text("Ce reçu fait foi de la transaction.", pageWidth - 200, doc.internal.pageSize.getHeight() - 60, { align: "right" })

  // Téléchargement
  doc.save(`${booking.bookingId}_recu.pdf`)
}

function adaptApiItems(apiItems: any[]): any[] {
  return apiItems.map((it) => {
    const start = new Date(it.start_date)
    const end = new Date(it.end_date)
    const duration = Math.abs((end.getTime() - start.getTime()) / (1000 * 60 * 60))

    return {
      id: String(it.id),
      roomId: String(it.ressource_id),
      roomName: `Salle #${it.ressource_name}`, // à remplacer si tu récupères le vrai nom
      price: parseFloat(it.price),
      date: start.toISOString().split("T")[0],
      startTime: start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      endTime: end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      duration,
      location: "2ème étage - Bâtiment B", // idem : remplacer par vrai champ si API
    }
  })
}

export default function Page () {
    const { items, total, isOpen, addItem, removeItem, clearCart, toggleCart, openCart, closeCart, setItems } = useCartStore()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        company: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardName: "",
    })

    useEffect(() => {
        const loadAchat = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/achat`, {
                    method: "GET",
                    credentials: "include"
                })
                const data = await response.json()
                const adaptedItems = adaptApiItems(data.items)
                setItems(adaptedItems)
                const [firstName, ...rest] = data.user.fullname.split(" ")
                setFormData((prev) => ({
                ...prev,
                email: data.user.email,
                firstName: firstName || "",
                lastName: rest.join(" ") || "",
                }))
            } catch (err) {
                console.error(err)
            }
        }
        loadAchat()
  }, [addItem])

    // useEffect(() => {
    //     if (items.length === 0) {
    //         router.push("/")
    //     }
    // }, [items.length, router])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        const matches = v.match(/\d{4,16}/g)
        const match = (matches && matches[0]) || ""
        const parts = []

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }

        if (parts.length) {
            return parts.join(" ")
        } else {
            return v
        }
    }

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`
        }
        return v
    }

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value)
        if (formatted.length <= 19) {
            handleInputChange("cardNumber", formatted)
        }
    }

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value)
        if (formatted.length <= 5) {
            handleInputChange("expiryDate", formatted)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!formData.phoneNumber || !formData.transactionId) {
            alert("Veuillez renseigner le numéro OM et l'ID Transaction.")
            return
            }

        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 3000))
        const bookingId = `BK-${Date.now()}`
        const bookingData = {
        bookingId,
        customer: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            company: formData.company,
            phone: formData.phoneNumber,
        },
        items: items.map((it) => ({
            id: it.id,
            roomName: it.roomName,
            date: it.date,
            startTime: it.startTime,
            endTime: it.endTime,
            duration: it.duration,
            price: it.price,
        })),
        total,
        paymentMethod: "Orange Money",
        transactionId: formData.transactionId,
        paymentDate: new Date().toISOString(),
        }

        // générer pdf et le télécharger
        try {
        generateReceiptPdf(bookingData)
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/clear`, {
            method: "DELETE",
            credentials: "include"
        })
        // optionnel: stocker la réservation côté client/serveur ici
        // localStorage.setItem("lastBooking", JSON.stringify(bookingData))
        // clearCart() si tu veux vider le panier après le téléchargement
        } catch (err) {
        console.error(err)
        alert("Échec génération du reçu.")
        } finally {
        setLoading(false)
        }

        // Simulate successful paymen

        clearCart()

        if (items.length === 0) {
            return null
        }
    
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>

                    <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Finaliser la réservation</h1>
                            <p className="text-muted-foreground">Complétez vos informations pour confirmer votre réservation</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card>
                                <CardHeader>
                                <CardTitle className="text-lg">Informations de contact</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email ?? ""}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className="mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <Label htmlFor="firstName">Prénom *</Label>
                                    <Input
                                        id="firstName"
                                        required
                                        value={formData.firstName ?? ""}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        className="mt-1"
                                    />
                                    </div>
                                    <div>
                                    <Label htmlFor="lastName">Nom *</Label>
                                    <Input
                                        id="lastName"
                                        required
                                        value={formData.lastName ?? ""}
                                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        className="mt-1"
                                    />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="company">Entreprise</Label>
                                    <Input
                                    id="company"
                                    value={formData.company ?? ""}
                                    onChange={(e) => handleInputChange("company", e.target.value)}
                                    className="mt-1"
                                    />
                                </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex flex-col justify-center items-center gap-2">
                                    {/* Icône Orange Money (SVG custom car pas dans lucide) */}
                                    <img src="/orangemoney.png" className="w-[200px]" alt="icon ORange MOney" />
                                    Paiement Orange Money
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div>
                                    <Label htmlFor="phoneNumber">Numéro Orange Money *</Label>
                                    <Input
                                        id="phoneNumber"
                                        required
                                        placeholder="+261 32 xx xxx xx"
                                        value={formData.phoneNumber ?? ""}
                                        onChange={(e) =>
                                        handleInputChange("phoneNumber", e.target.value.replace(/\D/g, ""))
                                        }
                                        className="mt-1"
                                    />
                                    </div>

                                    <div>
                                    <Label htmlFor="transactionId">ID Transaction *</Label>
                                    <Input
                                        id="transactionId"
                                        required
                                        placeholder="Ex: OM123456789"
                                        value={formData.transactionId ?? ""}
                                        onChange={(e) => handleInputChange("transactionId", e.target.value)}
                                        className="mt-1"
                                    />
                                    </div>
                                </CardContent>
                            </Card>


                            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                                {loading ? (
                                    <PaymentSkeleton />
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        Payer {total} Ar
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Résumé de la commande</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3 p-3 bg-muted rounded-lg"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold truncate">{item.roomName}</h4>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{item.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(item.date).toLocaleDateString("fr-FR")}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {item.startTime} - {item.endTime} ({item.duration}h)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right mt-2">
                                            <div className="font-bold text-primary">{item.price * item.duration}Ar</div>
                                        </div>
                                    </div>
                                </motion.div>
                                ))}

                                <Separator />

                                <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Sous-total</span>
                                    <span>{total}Ar</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>TVA (20%)</span>
                                    <span>{Math.round(total * 0.2)}Ar</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total TTC</span>
                                    <span className="text-primary">{Math.round(total * 1.2)}Ar</span>
                                </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Paiement sécurisé SSL</span>
                        </div>
                    </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
