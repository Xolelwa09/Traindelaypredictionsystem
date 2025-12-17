// Service to generate directions from user location to bus stops

export interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
  icon: "straight" | "left" | "right" | "arrive";
  streetName?: string;
}

export interface RouteDirections {
  steps: DirectionStep[];
  totalDistance: string;
  totalDuration: string;
  routePoints: Array<{ latitude: number; longitude: number }>;
}

// Street data for generating realistic directions
const streetNames = [
  "Main Street",
  "Park Avenue",
  "Commerce Boulevard",
  "Station Road",
  "Transit Way",
  "Harbor Drive",
  "Market Street",
  "Broadway",
  "Central Avenue",
  "Gateway Plaza",
];

// Calculate walking route between two points
function calculateWalkingRoute(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Array<{ latitude: number; longitude: number }> {
  // For demo purposes, create a simple route with intermediate points
  const points: Array<{ latitude: number; longitude: number }> = [];
  
  const numSteps = 5;
  for (let i = 0; i <= numSteps; i++) {
    const progress = i / numSteps;
    const lat = fromLat + (toLat - fromLat) * progress;
    const lon = fromLon + (toLon - fromLon) * progress;
    
    // Add some variation to make it look more realistic
    const variation = Math.sin(i) * 0.0002;
    
    points.push({
      latitude: lat + variation,
      longitude: lon + variation,
    });
  }
  
  return points;
}

// Generate turn-by-turn directions
function generateDirectionSteps(
  distance: number,
  duration: number
): DirectionStep[] {
  const steps: DirectionStep[] = [];
  
  // Starting step
  steps.push({
    instruction: "Head east on your current street",
    distance: "50m",
    duration: "1 min",
    icon: "straight",
  });
  
  // Calculate number of intermediate steps based on distance
  const numTurns = Math.min(Math.floor(distance / 300), 4);
  
  const remainingDistance = distance - 50;
  const stepDistance = numTurns > 0 ? remainingDistance / (numTurns + 1) : remainingDistance;
  
  for (let i = 0; i < numTurns; i++) {
    const turnTypes: Array<"left" | "right"> = ["left", "right"];
    const turnType = turnTypes[Math.floor(Math.random() * turnTypes.length)];
    const street = streetNames[Math.floor(Math.random() * streetNames.length)];
    
    steps.push({
      instruction: `Turn ${turnType} onto ${street}`,
      distance: `${Math.round(stepDistance)}m`,
      duration: `${Math.round(stepDistance / 83)} min`,
      icon: turnType,
      streetName: street,
    });
  }
  
  // Final approach
  const finalDistance = Math.round(stepDistance);
  steps.push({
    instruction: "Continue straight to bus stop",
    distance: `${finalDistance}m`,
    duration: `${Math.round(finalDistance / 83)} min`,
    icon: "straight",
  });
  
  // Arrival
  steps.push({
    instruction: "Arrive at bus stop",
    distance: "0m",
    duration: "0 min",
    icon: "arrive",
  });
  
  return steps;
}

// Format distance for display
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// Format duration for display
function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return "< 1 min";
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}min`;
}

// Main function to get directions to a bus stop
export async function getDirectionsToBusStop(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  busStopName: string,
  distance: number // in meters
): Promise<RouteDirections> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Calculate walking time (average speed: 5 km/h = 83 m/min)
  const durationMinutes = (distance / 1000) * 12;
  
  // Generate route points
  const routePoints = calculateWalkingRoute(fromLat, fromLon, toLat, toLon);
  
  // Generate turn-by-turn directions
  const steps = generateDirectionSteps(distance, durationMinutes);
  
  return {
    steps,
    totalDistance: formatDistance(distance),
    totalDuration: formatDuration(durationMinutes),
    routePoints,
  };
}

// Get directions by bus stop ID
export async function getDirectionsByBusStopId(
  busStopId: string,
  fromLat: number,
  fromLon: number,
  busStops: Array<{
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    distance: number;
  }>
): Promise<RouteDirections | null> {
  const busStop = busStops.find((stop) => stop.id === busStopId);
  
  if (!busStop) {
    return null;
  }
  
  return getDirectionsToBusStop(
    fromLat,
    fromLon,
    busStop.latitude,
    busStop.longitude,
    busStop.name,
    busStop.distance
  );
}
