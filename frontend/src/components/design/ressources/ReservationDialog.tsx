"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Euro, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogHeader, DialogDescription, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { ReservationData, Room } from '@/types/room';
import { calculatePrice, formatPrice, getDurationText } from '@/lib/priceCalculator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ReservationDialogProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reservationData: ReservationData) => void;
  reserveLoading: boolean;
}

export function ReservationDialog({ room, isOpen, onClose, onConfirm, reserveLoading }: ReservationDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceData, setPriceData] = useState<{
    price: number;
    duration_type: string;
    duration_count: number;
  } | null>(null);

  useEffect(() => {
    if (startDate && endDate && room) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start < end) {
        const calculation = calculatePrice(start, end, room.tarifs);
        setPriceData(calculation);
      } else {
        setPriceData(null);
      }
    }
  }, [startDate, endDate, room]);

  const handleConfirm = () => {
    if (room && startDate && endDate && priceData) {
      const reservationData: ReservationData = {
        start_date: startDate,
        end_date: endDate,
        price: priceData.price,
        duration_type: priceData.duration_type as 'hours' | 'days' | 'weeks' | 'months' | 'years',
        duration_count: priceData.duration_count,
        ressource_id: room.id,
      };
      onConfirm(reservationData);
    }
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setPriceData(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!room) return null;

  const now = new Date();
  const minDateTime = format(now, "yyyy-MM-dd'T'HH:mm");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
  <DialogContent className="sm:max-w-[800px] max-h-[100vh]">
    <DialogHeader className="col-span-2">
      <DialogTitle className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        Réserver {room.name}
      </DialogTitle>
      <DialogDescription>
        Choisissez vos dates et heures de réservation. Le tarif sera calculé automatiquement selon la durée.
      </DialogDescription>
    </DialogHeader>

    {/* Contenu en 2 colonnes */}
    <main className="flex gap-2">
        <div className="space-y-4 w-full">
      {/* Room info - occupe les 2 colonnes */}
      <div className="bg-gray-50 dark:bg-secondary dark:text-white p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{room.name}</h3>
          <span className="text-sm text-gray-500">{room.location}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-white mb-2">{room.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-white">
          <span>Capacité: {room.capacity} personnes</span>
          <span>•</span>
          <span>{room.company_name}</span>
        </div>
      </div>

      {/* Date inputs */}
      <div className="space-y-2">
        <Label htmlFor="start-date">Date et heure de début</Label>
        <Input
          id="start-date"
          type="datetime-local"
          value={startDate}
          min={minDateTime}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end-date">Date et heure de fin</Label>
        <Input
          id="end-date"
          type="datetime-local"
          value={endDate}
          min={startDate || minDateTime}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full"
        />
      </div>
        </div>

        <div className="space-y-4 w-full">
            {/* Price calculation */}
        {priceData && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg col-span-2">
            <div className="flex items-center gap-2 mb-2">
                <Euro className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Résumé de la réservation</span>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                <span>Durée:</span>
                <span className="font-medium">
                    {getDurationText(priceData.duration_type, priceData.duration_count)}
                </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                <span className="font-semibold">Prix total:</span>
                <span className="font-bold text-lg text-blue-600">
                    {formatPrice(priceData.price)}
                </span>
                </div>
            </div>
            </div>
        )}

        {/* Tarif information */}
        <div className="bg-gray-50 dark:bg-secondary dark:text-white p-3 rounded-lg text-xs text-gray-600 col-span-2">
            <p className="font-semibold mb-1">Tarifs de référence:</p>
            <div className="grid grid-cols-2 gap-2">
            <span>Heure: {formatPrice(parseFloat(room.tarifs.tarif_h))}</span>
            <span>Jour: {formatPrice(parseFloat(room.tarifs.tarif_j))}</span>
            <span>Semaine: {formatPrice(parseFloat(room.tarifs.tarif_sem))}</span>
            <span>Mois: {formatPrice(parseFloat(room.tarifs.tarif_mois))}</span>
            </div>
        </div>
        </div>
    </main>

    <DialogFooter className="col-span-2">
      <Button variant="outline" onClick={handleClose}>
        Annuler
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={!startDate || !endDate || !priceData || reserveLoading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {reserveLoading ? <Loader2 className="mr-2 h-4 w-4 animate-pulse" /> : <Clock className="w-4 h-4 mr-2" />}
        Confirmer la réservation
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

  );
}