"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Building2, Eye, Package } from "lucide-react"
import { useEffect, useState } from "react"
import { ResourcesGrid } from "./section/ressource-grid"

export default function Ressources () {
    const [ressources, setRessources] = useState([])
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
        loadRessources()
    }, [])
    if (ressources.length === 0) return null
    const stats = {
        total: ressources.length,
        available: ressources.filter((r) => r.availability).length,
        types: ressources.length,
    }
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                            <p className="text-2xl font-bold text-card-foreground">
                                {stats.total}
                            </p>
                            <p className="text-muted-foreground">
                                Ressources totales
                            </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-card-foreground">
                                {stats.available}
                            </p>
                            <p className="text-muted-foreground">
                                Disponibles
                            </p>
                        </div>
                    </div>
                    </CardContent>
                </Card>

            <Card>
                <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue/10 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-card-foreground">{stats.types}</p>
                        <p className="text-muted-foreground">Types de ressources</p>
                    </div>
                </div>
                </CardContent>
            </Card>
            </motion.div>

            <div className="">
                <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">Ressources ({ressources.length})</h2>
                <div className="flex gap-2">
                  {/* {selectedTypes.length > 0 && (
                    <Badge variant="secondary">
                      {selectedTypes.length} type{selectedTypes.length > 1 ? "s" : ""} sélectionné
                      {selectedTypes.length > 1 ? "s" : ""}
                    </Badge>
                  )} */}
                  {/* {selectedStatus.length > 0 && (
                    <Badge variant="secondary">
                      {selectedStatus.length} statut{selectedStatus.length > 1 ? "s" : ""} sélectionné
                      {selectedStatus.length > 1 ? "s" : ""}
                    </Badge>
                  )} */}
                </div>
              </div>
            </motion.div>

            <ResourcesGrid resources={ressources} />
          </div>
            </div>

        </>
    )
}