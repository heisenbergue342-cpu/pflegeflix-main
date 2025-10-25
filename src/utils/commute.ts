import { germanCities } from "@/data/cities_de";

export type CommuteMode = "car" | "transit";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function findCityCoords(name: string): { lat: number; lon: number } | null {
  const city = germanCities.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (!city) return null;
  return { lat: city.lat, lon: city.lon };
}

export function estimateCommuteMinutes(distanceKm: number, mode: CommuteMode = "car"): number {
  // Simple placeholder assumptions:
  // Car: ~50 km/h average; Transit: ~30 km/h average
  const speedKmH = mode === "car" ? 50 : 30;
  const minutes = (distanceKm / speedKmH) * 60;
  // Add a small fixed overhead (parking/wait) to make more realistic
  const overhead = mode === "car" ? 5 : 10;
  return Math.round(minutes + overhead);
}

export function estimateCommuteFromCities(startCity: string, jobCity: string, mode: CommuteMode = "car"): number | null {
  const start = findCityCoords(startCity);
  const dest = findCityCoords(jobCity);
  if (!start || !dest) return null;
  const km = haversineKm(start.lat, start.lon, dest.lat, dest.lon);
  return estimateCommuteMinutes(km, mode);
}