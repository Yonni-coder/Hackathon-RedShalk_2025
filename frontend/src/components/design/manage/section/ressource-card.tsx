import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Eye, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ResourceCard({ resource, onViewDetails }) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

    const statusColors = {
        active: "bg-green-500",
        maintenance: "bg-yellow-500",
        inactive: "bg-red-500",
    }

    const statusLabels = {
        active: "Actif",
        maintenance: "Maintenance",
        inactive: "Inactif",
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
        >
            <Card 
                className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow duration-300"
            >
            {/* <CardHeader className="p-0 relative">
                {resource.photos.length > 0 && (
                    <div className="relative h-48 overflow-hidden">
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="h-full">
                            <Image
                                src={
                                    resource.photos[currentPhotoIndex]?.photo_url ||
                                    "/placeholder.svg?height=200&width=300&query=resource"
                                }
                                alt={resource.name}
                                fill
                                className="object-cover"
                            />
                        </motion.div>

                        {resource.photos.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                {resource.photos.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPhotoIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                        index === currentPhotoIndex ? "bg-white" : "bg-white/50"
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="absolute top-3 right-3">
                            <div className={`w-3 h-3 rounded-full ${statusColors[resource.status as any]}`} />
                        </div>
                    </div>
                )}
            </CardHeader> */}

            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
                            {resource.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1">
                            {resource.type_name}
                        </Badge>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {resource.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{resource.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{resource.capacity}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <span
                        className={`text-xs px-2 py-1 rounded-full ${
                            resource.availability
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                        >
                        {resource.availability ? "Disponible" : "Indisponible"}
                        </span>
                        <span className="text-xs text-muted-foreground">{statusLabels[resource.status as any]}</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(resource)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        Détails
                    </Button>
                    
                </div>
            </CardContent>
            </Card>
        </motion.div>
    )
}