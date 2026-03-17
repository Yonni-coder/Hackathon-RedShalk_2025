"use client"

import { useMemo } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface Booking {
  id: number
  ressource_id: number
  start_date: string
  end_date: string
  status: string
}

interface Room {
  id: number
  name: string
  description: string
  capacity: string
  location: string
  status: string
  type_name: string
  company_name: string
  tarifs: {
    tarif_j: string
  }
  photos: { id: number; photo_url: string }[]
}

export default function AvailableRooms({
  rooms,
  bookings,
}: {
  rooms: Room[]
  bookings: Booking[]
}) {
  const now = new Date()

  const availableRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Vérifie si la salle est réservée actuellement
      const activeBooking = bookings.find((b) => {
        const start = new Date(b.start_date)
        const end = new Date(b.end_date)
        return (
          b.ressource_id === room.id &&
          now >= start &&
          now <= end &&
          b.status !== "cancelled"
        )
      })
      return !activeBooking // disponible si aucune réservation active
    })
  }, [rooms, bookings, now])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {availableRooms.length === 0 && (
        <p className="text-center text-gray-500 col-span-full">
          Aucune salle disponible pour le moment
        </p>
      )}

      {availableRooms.map((room) => (
        <motion.div
          key={room.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden shadow-lg rounded-2xl">
            <div className="relative h-40 w-full">
              <img
                src={`/assets/images/all/smartworks-coworking-E7Tzh2TTS6c-unsplash.jpg`}
                alt={room.name}
                className="w-full object-cover"
              />
              <Badge className="absolute top-2 left-2 bg-green-600">
                Disponible
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{room.name}</CardTitle>
              <p className="text-sm text-gray-500">{room.location}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700 line-clamp-2">
                {room.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Capacité: {room.capacity} pers.</span>
                <span className="font-semibold">
                  {Number(room.tarifs.tarif_j).toLocaleString()} Ar / jour
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
