"use client"

import { ReservationDialog } from "@/components/design/ressources/ReservationDialog";
import { RoomCard } from "@/components/design/ressources/RoomCard";
import { RoomSkeletonGrid } from "@/components/design/ressources/RoomSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useInfiniteRooms } from "@/hooks/useInfiniteRooms";
import { useUserLocation } from "@/hooks/useUserLocator";
import { haversineDistance } from "@/lib/locator";
import { useCartStore } from "@/stores/cartStore";
import useRoomsStore from "@/stores/roomsStore";
import { ReservationData, Room } from "@/types/room";
import { motion } from "framer-motion";
import { Building2, Filter, Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Page() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [reserveLoading, setReserveLoading] = useState(false)
  const { setRooms } = useRoomsStore()
  const { addItem } = useCartStore()
  const [useProximity, setUseProximity] = useState(false)
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null); // optionnel (ex: 5 km)

  const { position, loading: locLoading, error: locError, requestLocation } = useUserLocation()
  
  const sampleRooms = useRoomsStore((s) => s.rooms)

  // Filter rooms based on search and type
  const filteredRooms = useMemo(() => {
    let filtered = sampleRooms;

    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, sampleRooms]);

  const roomsSortedByProximity = useMemo(() => {
    if (!useProximity || !position) return filteredRooms;

    const enriched = filteredRooms
      .map((r) => {
        if (typeof r.latitude !== "number" || typeof r.longitude !== "number") {
          return { ...r, _distance: Infinity }; // absent : pousse en fin
        }
        const d = haversineDistance(position.lat, position.lng, r.latitude, r.longitude);
        return { ...r, _distance: d };
      })
      .filter((r) => {
        if (r._distance === Infinity) return false; // option : cacher les salles sans coords
        if (maxDistanceKm == null) return true;
        return (r._distance ?? Infinity) <= maxDistanceKm;
      })
      .sort((a, b) => (a._distance ?? Infinity) - (b._distance ?? Infinity));

    return enriched;
  }, [filteredRooms, useProximity, position, maxDistanceKm])

  const roomsToDisplay = useMemo(() => (useProximity ? roomsSortedByProximity : filteredRooms), [useProximity, roomsSortedByProximity, filteredRooms])

  // Get unique room types for filter
  const roomTypes = useMemo(() => {
    const types = Array.from(new Set(sampleRooms.map(room => room.type_name)));
    return types;
  }, []);

  const { rooms, loading, hasMore, loadMore } = useInfiniteRooms({
    initialRooms: roomsToDisplay,
    filterType: selectedTypeFilter,
  });

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef } = useInView({
    threshold: 0.1,
    onChange: (inView) => {
      if (inView && hasMore && !loading) {
        loadMore();
      }
    },
  });

  const handleReserve = (room: Room) => {
    setSelectedRoom(room);
    setIsReservationDialogOpen(true);
  };

  const handleReservationConfirm = async (reservationData: ReservationData) => {
    setReserveLoading(true)
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reservations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                price: reservationData.price,
                start_date: reservationData.start_date,
                end_date: reservationData.end_date,
                ressource_id: reservationData.ressource_id,
            }),
        })
        const result = await response.json()
        if (response.ok) {
            toast.success("Reservation transmit")
            handleCloseReservationDialog()
            addItem(result.cartItem)
        }
        if (!response.ok) {
          toast.error(result.details)
        }
    } catch (err) {
        console.error(err)
    } finally {
        setReserveLoading(false)
    }
  };

  const handleCloseReservationDialog = () => {
    setIsReservationDialogOpen(false);
    setSelectedRoom(null);
  };

  return (
    <div className="min-h-screen border-l-1 border-r-1 border-secondary">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Nos Espaces de Travail
          </h1>
          <p className="text-xl text-gray-600 dark:text-white max-w-3xl mx-auto">
            Découvrez nos salles équipées et réservez l'espace parfait pour vos besoins professionnels
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 space-y-4"
        >
  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
    {/* Search */}
    <div className="relative flex-1 max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        placeholder="Rechercher une salle, lieu ou description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-10 bg-white/80 backdrop-blur-sm border-slate-200"
      />
      {/* Clear button */}
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-slate-100"
          aria-label="Effacer la recherche"
        >
          ✕
        </button>
      )}
    </div>

    {/* Controls group */}
    <div className="flex items-center gap-3">
      <Button
        variant={useProximity ? "default" : "outline"}
        onClick={() => {
          if (!position) requestLocation();
          setUseProximity((s) => !s);
        }}
        className="flex items-center gap-2"
      >
        <MapPin className="w-4 h-4" />
        <span className="text-sm">
          {useProximity ? "Trier par proximité" : "Près de moi"}
        </span>
      </Button>

      {/* Max distance */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Max km"
          value={maxDistanceKm ?? ""}
          onChange={(e) =>
            setMaxDistanceKm(e.target.value ? Number(e.target.value) : null)
          }
          className="w-28 text-sm"
        />
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-500" />
        <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
          <SelectTrigger className="w-44 bg-white/80 backdrop-blur-sm border-slate-200 text-sm">
            <SelectValue placeholder="Type de salle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {roomTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>

  {/* Location status & errors */}
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
    <div className="flex items-center gap-3 text-sm text-slate-600">
      {locLoading && (
        <div className="inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Obtention de la position…</span>
        </div>
      )}
      {locError && <span className="text-red-500">Erreur géoloc : {locError}</span>}
      {position && useProximity && (
        <span className="inline-flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500" />
          Vous êtes à {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </span>
      )}
    </div>

    {/* Stats pills */}
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-secondary border rounded-md px-3 py-1 text-sm">
        <Building2 className="w-4 h-4 text-slate-600" />
        <span>{rooms.length} salles</span>
      </div>

      <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-secondary border rounded-md px-3 py-1 text-sm">
        <MapPin className="w-4 h-4 text-slate-600" />
        <span>3 bâtiments</span>
      </div>

      {selectedTypeFilter !== "all" && (
        <Badge variant="secondary" className="flex items-center gap-2 px-2 py-1 text-sm">
          <Filter className="w-3 h-3" />
          {selectedTypeFilter}
        </Badge>
      )}
    </div>
  </div>
</motion.div>


        {/* Rooms Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onReserve={handleReserve}
            />
          ))}
        </motion.div>

        {/* Loading Skeleton */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <RoomSkeletonGrid count={3} />
          </motion.div>
        )}

        {/* Load More Trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="mt-8 text-center">
            <div className="text-gray-500">Chargement de plus de salles...</div>
          </div>
        )}

        {/* No Results */}
        {!loading && rooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-lg mb-4">Aucune salle trouvée</div>
            <p className="text-gray-500">
              Essayez de modifier vos filtres de recherche
            </p>
          </motion.div>
        )}

        {/* Reservation Dialog */}
        <ReservationDialog
          room={selectedRoom}
          isOpen={isReservationDialogOpen}
          onClose={handleCloseReservationDialog}
          onConfirm={handleReservationConfirm}
          reserveLoading={reserveLoading}
        />
      </div>
    </div>
  );
}