import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';
import { RoomTarif } from '../types/room';

export interface PriceCalculation {
  price: number;
  duration_type: 'hours' | 'days' | 'weeks' | 'months' | 'years';
  duration_count: number;
}

export const calculatePrice = (startDate: Date, endDate: Date, tarifs: RoomTarif): PriceCalculation => {
  const hours = differenceInHours(endDate, startDate);
  const days = differenceInDays(endDate, startDate);
  const weeks = differenceInWeeks(endDate, startDate);
  const months = differenceInMonths(endDate, startDate);
  const years = differenceInYears(endDate, startDate);

  const hourlyRate = parseFloat(tarifs.tarif_h);
  const dailyRate = parseFloat(tarifs.tarif_j);
  const weeklyRate = parseFloat(tarifs.tarif_sem);
  const monthlyRate = parseFloat(tarifs.tarif_mois);
  const yearlyRate = parseFloat(tarifs.tarif_an);

  // Calculate prices for different durations
  const hourPrice = hours * hourlyRate;
  const dayPrice = days * dailyRate;
  const weekPrice = weeks * weeklyRate;
  const monthPrice = months * monthlyRate;
  const yearPrice = years * yearlyRate;

  // Choose the most economical option
  if (years > 0 && yearPrice < hourPrice) {
    return { price: yearPrice, duration_type: 'years', duration_count: years };
  }
  if (months > 0 && monthPrice < hourPrice) {
    return { price: monthPrice, duration_type: 'months', duration_count: months };
  }
  if (weeks > 0 && weekPrice < hourPrice) {
    return { price: weekPrice, duration_type: 'weeks', duration_count: weeks };
  }
  if (days > 0 && dayPrice < hourPrice) {
    return { price: dayPrice, duration_type: 'days', duration_count: days };
  }
  
  return { price: hourPrice, duration_type: 'hours', duration_count: hours };
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const getDurationText = (durationType: string, count: number): string => {
  const durations = {
    hours: count === 1 ? 'heure' : 'heures',
    days: count === 1 ? 'jour' : 'jours', 
    weeks: count === 1 ? 'semaine' : 'semaines',
    months: count === 1 ? 'mois' : 'mois',
    years: count === 1 ? 'année' : 'années',
  };
  
  return `${count} ${durations[durationType as keyof typeof durations]}`;
};