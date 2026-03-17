"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Tooltip,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Users,
  Building,
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Wifi,
  Home,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Library,
  FolderPlus,
  User,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Logo from "@/components/design/logo"
import TypesForm from "@/components/design/manage/types-forms"
import RessourcesForm from "@/components/design/manage/ressources-forms"
import Ressources from "@/components/design/manage/ressources"
import { buildSampleData } from "@/lib/buildSimpleData"
import UsersDashboard from "@/components/fictifs-users"
import AvailableRooms from "@/components/availableRooms"

export default function CoworkingDashboard() {
    const [activeSection, setActiveSection] = useState("dashboard")
    const [ressources, setRessources] = useState([])
    const [reservations, setReservations] = useState([])

    useEffect(() => {
            const loadRessources = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ressources`, {
                        method: "GET",
                        credentials: "include"
                    })
                    const data = await response.json()
                    setRessources(data)
                } catch (err) {
                    console.error(err)
                }
            }
            const loadReservations = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations`, {
                        method: "GET",
                        credentials: "include"
                    })
                    const data = await response.json()
                    setReservations(data)
                } catch (err) {
                    console.error(err)
                }
            }
            loadReservations()
            loadRessources()
        }, [])

    const { sampleResources, sampleBookings } = buildSampleData({
        bookings: reservations,
        resources: ressources,
    })

    const ress = sampleResources
    const books = sampleBookings

    const { weekStart, weekEnd } = useMemo(() => {
        const now = new Date()
        const day = now.getDay()
        const offsetToMonday = (day + 6) % 7
        const monday = new Date(now)
        monday.setHours(0, 0, 0, 0)
        monday.setDate(now.getDate() - offsetToMonday)
        const sunday = new Date(monday)
        sunday.setHours(23, 59, 59, 999)
        sunday.setDate(monday.getDate() + 6)
        return { weekStart: monday, weekEnd: sunday }
    }, [])

    function parseISOToDate(iso) {
        return new Date(iso)
    }

    const MS_PER_DAY = 1000 * 60 * 60 * 24


    function overlapDays(startA, endA, startB, endB) {
        const start = startA > startB ? startA : startB
        const end = endA < endB ? endA : endB
        const overlapMs = end - start
        if (isNaN(overlapMs) || overlapMs <= 0) return 0
        return Math.min(7, Math.ceil((overlapMs + 1) / MS_PER_DAY))
    }

    const chartData = useMemo(() => {
        return ress.map((r) => {
            const related = books.filter((b) => Number(b.ressource_id) === Number(r.id))
            let bookedDays = 0
            for (const b of related) {
                const s = parseISOToDate(b.start_date)
                const e = parseISOToDate(b.end_date)
                bookedDays += overlapDays(s, e, weekStart, weekEnd)
            }
            if (bookedDays > 7) bookedDays = 7
            const freeDays = 7 - bookedDays
            const tarif_j = r.tarifs && r.tarifs.tarif_j ? Number(r.tarifs.tarif_j) : null
            return {
                id: r.id,
                name: r.name || `Ressource ${r.id}`,
                booked: bookedDays,
                free: freeDays,
                tarif_j,
            }
    })
    }, [ress, books, weekStart, weekEnd])

    const COLORS = { booked: "#ef4444", free: "#10b981" }

    const sidebarItems = [
        { id: "dashboard", label: "Tableau de Bord", icon: Home },
        { id: "available", label: "Salle Disponible", icon: Building },
        { id: "users", label: "Employé", icon: User },
        { id: "ressources", label: "Espace", icon: Library },
        { id: "create_ressources", label: "Créer un Espace", icon: FolderPlus },
    ]

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 px-2 py-1">
                            <Logo />
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {sidebarItems.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <SidebarMenuItem key={item.id}>
                                                <SidebarMenuButton
                                                    onClick={() => setActiveSection(item.id)}
                                                    isActive={activeSection === item.id}
                                                    tooltip={item.label}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Déconnexion">
                                <LogOut className="h-4 w-4" />
                                <span>Déconnexion</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex flex-1 items-center justify-between">
                        <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {sidebarItems.find((item) => item.id === activeSection)?.label || "Tableau de Bord"}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestion et statistiques de votre entreprise
                        </p>
                        </div>
                    </div>
                    </header>

                    <div className="flex-1 space-y-4 p-4 pt-6">
                    {activeSection === "dashboard" && (
                        <div className="p-4">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Disponibilité cette semaine</h2>
                                <p className="text-sm text-muted-foreground">
                                Période : {weekStart.toLocaleDateString()} — {weekEnd.toLocaleDateString()}
                                </p>
                            </div>


                            <div className="w-full h-72 bg-secondary rounded-lg shadow-sm p-3">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                                        >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} domain={[0, 7]} />
                                        <Tooltip
                                        formatter={(value, name, props) => {
                                        if (name === "tarif_j") return [value ? value.toLocaleString() : "-", "Tarif/j"]
                                        return [value, name]
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="free" stackId="a" name="Jours libres">
                                        {chartData.map((entry, idx) => (
                                            <Cell key={`cell-free-${idx}`} fill={COLORS.free} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="booked" stackId="a" name="Jours réservés">
                                    {chartData.map((entry, idx) => (
                                        <Cell key={`cell-booked-${idx}`} fill={COLORS.booked} />
                                    ))}
                                    </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>


                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {chartData.map((r) => (
                                <div key={r.id} className="p-3 bg-secondary rounded-lg shadow-sm">
                                <div className="flex items-center justify-between">
                                <div>
                                <div className="font-medium">{r.name}</div>
                                <div className="text-sm text-muted-foreground">{r.booked} jour(s) réservé(s)</div>
                                </div>
                                <div className="text-right">
                                <div className="text-sm">Libre : {r.free} / 7 jours</div>
                                <div className="text-sm">Tarif/j : {r.tarif_j ? r.tarif_j.toLocaleString() : "-"} Ar</div>
                                </div>
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}

                    {activeSection === "available" && (
                        <AvailableRooms
                            rooms={ress}
                            bookings={books}
                        />
                    )}

                    {activeSection === "users" && (
                        <UsersDashboard />
                    )}

                    {activeSection === "ressources" && (
                        <Ressources />
                    )}

                    {activeSection === "create_ressources" && (
                        <div className="flex items-start gap-5">
                            <RessourcesForm />
                            <TypesForm />
                        </div>
                    )}

                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
