"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert"; // optionnel si tu as un composant alert, sinon supprime
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationDialogProps {
  onSelectLocation: (data: {
    lat: string;
    lng: string;
    address: string;
    city: string;
    postalCode: string;
  }) => void;
  /** Optionnel : coordonnées initiales à afficher dans la map dialog */
  initial?: { lat: number; lng: number } | null;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    // utilisez flyTo pour une transition douce
    map.flyTo(center, zoom ?? 15, { duration: 0.7 });
  }, [center?.[0], center?.[1]]);
  return null;
}

export default function LocationDialog({ onSelectLocation, initial = null }: LocationDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(initial ? [initial.lat, initial.lng] : null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(initial ? [initial.lat, initial.lng] : [48.8566, 2.3522]); // Paris par défaut
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // reverse geocode
  const reverseGeocode = async (lat: number, lng: number) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  };

  // recherche par adresse (Nominatim)
  const handleSearch = async () => {
    setSearchError(null);
    if (!query.trim()) return;
    setLoadingSearch(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(
        query
      )}&accept-language=fr`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erreur réseau");
      const data = await res.json();
      if (!data || data.length === 0) {
        setSearchError("Aucun résultat trouvé.");
        return;
      }
      // prendre le premier résultat (tu peux présenter une liste si tu veux)
      const first = data[0];
      const lat = parseFloat(first.lat);
      const lon = parseFloat(first.lon);
      setMarkerPos([lat, lon]);
      setMapCenter([lat, lon]);
    } catch (err: any) {
      console.error(err);
      setSearchError("Erreur lors de la recherche. Réessaye.");
    } finally {
      setLoadingSearch(false);
    }
  };

  // gestion de clic (placer marqueur)
  function ClickHandler() {
    // useMapEvents doit être utilisé **dans** MapContainer; ici on crée un composant interne
    // avec side effect sur markerPos et mapCenter :
    const { useMapEvents } = require("react-leaflet");
    useMapEvents({
      click: (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        setMarkerPos([lat, lng]);
        setMapCenter([lat, lng]);
      },
    });
    return null;
  }

  // confirmer sélection -> reverse geocode et envoi
  const handleConfirm = async () => {
    if (!markerPos) return;
    const [lat, lng] = markerPos;
    const data = await reverseGeocode(lat, lng);
    onSelectLocation({
      lat: String(lat),
      lng: String(lng),
      address: data?.display_name || (data?.address?.road ?? ""),
      city: data?.address?.city || data?.address?.town || data?.address?.village || "",
      postalCode: data?.address?.postcode || "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Choisir sur la carte</Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sélectionner une localisation</DialogTitle>
        </DialogHeader>

        {/* Recherche */}
        <div className="flex gap-2 items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Rechercher un lieu (ex: adresse, quartier, ville)..."
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loadingSearch}>
            {loadingSearch ? "Recherche…" : "Rechercher"}
          </Button>
        </div>

        {searchError && <p className="text-sm text-red-500 mt-2">{searchError}</p>}

        {/* Carte */}
        <div className="h-[420px] rounded-md overflow-hidden border mt-4">
          <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={mapCenter} zoom={15} />
            <ClickHandler />
            {markerPos && <Marker position={markerPos} />}
          </MapContainer>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Clique sur la carte pour placer le marqueur ou utilise la recherche.
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setMarkerPos(null); setQuery(""); }}>
              Effacer
            </Button>
            <Button onClick={handleConfirm} disabled={!markerPos}>
              Confirmer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
