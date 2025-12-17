// Service to find nearby bus stops based on user location

export interface BusStop {
  id: string;
  name: string;
  address: string;
  distance: number; // in meters
  latitude: number;
  longitude: number;
  routes: string[];
  estimatedWalkTime: string;
}

// Mock bus stops database (in a real app, this would come from an API)
const busStopsDatabase: Omit<BusStop, "distance" | "estimatedWalkTime">[] = [
  {
    id: "BS001",
    name: "Central Station Bus Hub",
    address: "123 Main Street",
    latitude: 40.7489,
    longitude: -73.9680,
    routes: ["10", "22", "45", "67", "88"],
  },
  {
    id: "BS002",
    name: "Gateway Plaza Stop",
    address: "456 Commerce Ave",
    latitude: 40.7510,
    longitude: -73.9720,
    routes: ["10", "33", "45"],
  },
  {
    id: "BS003",
    name: "North Park Transit",
    address: "789 Park Road",
    latitude: 40.7530,
    longitude: -73.9750,
    routes: ["22", "67", "88", "101"],
  },
  {
    id: "BS004",
    name: "Harbor View Terminal",
    address: "321 Waterfront Blvd",
    latitude: 40.7470,
    longitude: -73.9650,
    routes: ["45", "67", "88"],
  },
  {
    id: "BS005",
    name: "Downtown Express Stop",
    address: "555 Business District",
    latitude: 40.7520,
    longitude: -73.9700,
    routes: ["10", "22", "33", "Express 1"],
  },
  {
    id: "BS006",
    name: "West End Junction",
    address: "999 West Avenue",
    latitude: 40.7460,
    longitude: -73.9780,
    routes: ["22", "88", "101"],
  },
  {
    id: "BS007",
    name: "Airport Connector",
    address: "100 Terminal Drive",
    latitude: 40.7540,
    longitude: -73.9690,
    routes: ["Airport Shuttle", "Express 1", "101"],
  },
  {
    id: "BS008",
    name: "University Campus Stop",
    address: "200 College Way",
    latitude: 40.7450,
    longitude: -73.9730,
    routes: ["33", "45", "67"],
  },
];

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Calculate walking time based on distance (average walking speed: 5 km/h)
function calculateWalkTime(distanceMeters: number): string {
  const minutes = Math.round((distanceMeters / 1000) * 12); // 12 minutes per km
  if (minutes < 1) return "< 1 min walk";
  if (minutes === 1) return "1 min walk";
  return `${minutes} min walk`;
}

// Format distance for display
function formatDistance(meters: number): number {
  return Math.round(meters);
}

// Get nearby bus stops
export async function getNearbyBusStops(
  userLat: number,
  userLon: number,
  maxResults: number = 5
): Promise<BusStop[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Calculate distances and add to bus stops
  const stopsWithDistance = busStopsDatabase.map((stop) => ({
    ...stop,
    distance: formatDistance(
      calculateDistance(userLat, userLon, stop.latitude, stop.longitude)
    ),
    estimatedWalkTime: calculateWalkTime(
      calculateDistance(userLat, userLon, stop.latitude, stop.longitude)
    ),
  }));

  // Sort by distance and return top results
  return stopsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);
}

// Mock function to get user's current location
// In a real app, this would use the Geolocation API
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve) => {
    // Simulate geolocation delay
    setTimeout(() => {
      // Return a mock location near the bus stops
      resolve({
        latitude: 40.7500,
        longitude: -73.9700,
      });
    }, 500);
  });
}

// Check if geolocation is supported
export function isGeolocationSupported(): boolean {
  return "geolocation" in navigator;
}

// Request user location with error handling
export function requestUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission denied. Using default location."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out."));
            break;
          default:
            reject(new Error("An unknown error occurred."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}
