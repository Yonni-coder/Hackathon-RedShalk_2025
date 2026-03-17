"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Library, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import LocationDialog from "@/components/locationDialog";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ressourceSchema = z.object({
  name: z.string().nonempty("Ce champ est requis"),
  description: z.string().nonempty("Ce champ est requis"),
  capacity: z.number().optional(),
  type_id: z.number(),
  availability: z.string().nonempty("Ce champ est requis"),
  latitude: z.string().nonempty("Ce champ est requis"),
  longitude: z.string().nonempty("Ce champ est requis"),
  postalCode: z.string().nonempty("Ce champ est requis"),
  address: z.string().nonempty("Ce champ est requis"),
  city: z.string().nonempty("Ce champ est requis"),
});

type ressourceFormValues = z.infer<typeof ressourceSchema>;

export default function RessourcesForm() {
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<any[]>([]);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ressourceFormValues>({
    mode: "onTouched",
    resolver: zodResolver(ressourceSchema),
    defaultValues: {
      name: "",
      description: "",
      capacity: undefined,
      type_id: undefined as any,
      availability: "",
      latitude: "",
      longitude: "",
      postalCode: "",
      address: "",
      city: "",
    },
  });

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/types`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setTypes(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadTypes();
  }, []);

  // Auto fill with browser geolocation
  const onAutoFill = () => {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Géolocalisation non supportée par ce navigateur.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          setValue("latitude", String(lat));
          setValue("longitude", String(lon));
          setMarkerPos({ lat, lng: lon });
        } catch (e: any) {
          console.error(e);
          setError("Impossible d'obtenir l'adresse depuis les coordonnées.");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        setError(err.message || "Permission géolocalisation refusée ou erreur.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (data: ressourceFormValues) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ressources/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ data }),
      });
      if (!response.ok) {
        toast.error("Une Erreur est survenue");
      } else {
        toast.success("Ajout ressource réussie");
        reset();
        setMarkerPos(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Création Espace</CardTitle>
        <CardDescription>
          Ajoutez et configurez vos espaces physiques (Espace Business, Coin, Salle de Conférence, etc.)
          afin de les rendre disponibles pour réservation.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section Infos générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input {...register("name")} placeholder="Nom de la ressource" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>
                Disponibilité <span className="text-red-500">*</span>
              </Label>
              <Input {...register("availability")} placeholder="Ex: 9h-18h" />
              {errors.availability && (
                <p className="text-red-500 text-sm">{errors.availability.message}</p>
              )}
            </div>
          </div>

          {/* Section Localisation */}
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="text-xl text-center font-bold">Localisation</h2>
            <div className="flex justify-center items-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onAutoFill} disabled={geoLoading}>
                  {geoLoading ? "Localisation…" : "Ma Position"}
                </Button>
                <LocationDialog
                  onSelectLocation={(loc) => {
                    setValue("latitude", loc.lat)
                    setValue("longitude", loc.lng)
                    setValue("address", loc.address)
                    setValue("city", loc.city)
                    setValue("postalCode", loc.postalCode)
                    setMarkerPos({ lat: Number(loc.lat), lng: Number(loc.lng) })
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adresse :</Label>
                <Input {...register("address")} placeholder="Adresse" />
              </div>
              <div className="space-y-2">
                <Label>Ville :</Label>
                <Input {...register("city")} placeholder="Ville" />
              </div>
              <div className="space-y-2">
                <Label>Code postal :</Label>
                <Input {...register("postalCode")} placeholder="Code postal" />
              </div>
              <div className="space-y-2">
                <Label>Latitude :</Label>
                <Input {...register("latitude")} placeholder="Latitude" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Longitude :</Label>
                <Input {...register("longitude")} placeholder="Longitude" readOnly />
              </div>
            </div>
          </div>

          {/* Section Capacités & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Capacité :</Label>
              <Input
                {...register("capacity", {
                  setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
                })}
                placeholder="Capacité"
              />
              {errors.capacity && (
                <p className="text-red-500 text-sm">{errors.capacity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(val) =>
                  setValue("type_id", Number(val) as any, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir le type" />
                </SelectTrigger>
                <SelectContent>
                  {types?.map((type, index) => (
                    <SelectItem key={index} value={String(type?.id)}>
                      {type?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type_id && (
                <p className="text-red-500 text-sm">{(errors.type_id as any)?.message}</p>
              )}
            </div>
          </div>

          {/* Section Description */}
          <div className="space-y-2">
            <Label>
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea {...register("description")} placeholder="Description du ressource" />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            disabled={!isValid || isSubmitting}
            variant="default"
            type="submit"
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Library className="w-4 h-4 mr-2" />
            )}
            Créer l'espace
          </Button>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {reverseLoading && <p className="text-sm mt-2">Récupération de l'adresse…</p>}
        </form>
      </CardContent>
    </Card>
  );
}
