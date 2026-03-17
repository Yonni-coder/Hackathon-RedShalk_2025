"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Building2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Room } from '@/types/room';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/priceCalculator';
import { Button } from '@/components/ui/button';


interface RoomCardProps {
  room: Room;
  onReserve: (room: Room) => void;
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const scaleOnHover = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};

export function RoomCard({ room, onReserve }: RoomCardProps) {
  const isAvailable = room.status === 'libre';
  const basePrice = parseFloat(room.tarifs.tarif_h);
  
  // Extract features from description (simple parsing)
  const features = room.description.split(',').map(f => f.trim()).filter(f => f.length > 0).slice(0, 3);

  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? room.photos.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === room.photos.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <motion.div variants={fadeInUp} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
      <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
      {/* Image affichée */}
      <img
        src={`/images/${room.photos?.[currentIndex]?.photo_url}` || "/assets/images/.svg"}
        alt={room.name}
        className="w-full h-48 object-cover rounded-lg"
      />

      {/* Badge disponibilité */}
      <div className="absolute top-4 left-4">
        <Badge variant={isAvailable ? "default" : "secondary"}>
          {isAvailable ? "Disponible" : "Occupé"}
        </Badge>
      </div>

      {/* Badge type */}
      <div className="absolute top-4 right-4">
        <Badge variant="outline" className="bg-background/80">
          {room.type_name}
        </Badge>
      </div>

      {/* Boutons navigation */}
      {room.photos?.length > 1 && (
        <>
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full shadow-md"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full shadow-md"
            onClick={handleNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Petits indicateurs */}
      {room.photos?.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {room.photos.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? "bg-white" : "bg-gray-400/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>

        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg mb-2">
                {room.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                {room.capacity} personnes
              </CardDescription>
              <CardDescription className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" />
                {room.location}
              </CardDescription>
              <CardDescription className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {room.company_name}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                4.8
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {feature.substring(0, 35) + (feature.length > 35 ? "..." : "")}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between w-full">
              <div>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(basePrice)}
                </span>
                <span className="text-sm text-muted-foreground ml-1">/heure</span>
              </div>
              <motion.div {...scaleOnHover}>
                <Button 
                  disabled={!isAvailable} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  onClick={() => onReserve(room)}
                >
                  {isAvailable ? "Réserver" : "Indisponible"}
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}