// Service to generate map data for train routes

interface Station {
  name: string;
  position: number;
  isPassed: boolean;
  isCurrent: boolean;
}

interface MapData {
  stations: Station[];
  progress: number;
}

// Route definitions for known trains
const routeDefinitions: Record<string, string[]> = {
  "205": [
    "South Terminal",
    "Gateway Station",
    "Central Junction",
    "Commerce Plaza",
    "North Park",
    "Central Station"
  ],
  "450": [
    "West End",
    "Market Square",
    "City Center",
    "Main Station",
    "East Terminal"
  ],
  "132": [
    "Airport Terminal",
    "Business District",
    "North Terminal",
    "Harbor View",
    "Downtown Central",
    "University Campus",
    "Sports Complex"
  ],
  "301": [
    "Suburban Station",
    "West Station",
    "Industrial Park",
    "City Hall",
    "Central Station"
  ],
  "777": [
    "Maintenance Depot",
    "Service Bay 2",
    "Technical Center",
    "Main Station"
  ],
  "999": [
    "Old Town",
    "Heritage Plaza",
    "Museum Quarter",
    "City Center",
    "New District"
  ],
};

// Default route for unknown trains
const defaultRoute = [
  "Origin Station",
  "Midtown Stop",
  "Central Hub",
  "Destination Station"
];

export function generateMapData(
  trainNumber: string,
  currentLocation: string,
  delayMinutes: number
): MapData {
  // Extract numeric part of train number
  const trainNum = trainNumber.match(/\d+/)?.[0] || "";
  
  // Get route for this train
  let routeStations = routeDefinitions[trainNum] || defaultRoute;
  
  // If current location contains "from" and "to", it's a route-based search
  // Parse the route and create custom stations
  const routeMatch = currentLocation.match(/En route from (.+) to (.+)/i);
  if (routeMatch) {
    const origin = routeMatch[1];
    const destination = routeMatch[2];
    
    // Try to use the actual route if we have it, otherwise create a simple one
    if (routeDefinitions[trainNum]) {
      routeStations = routeDefinitions[trainNum];
    } else {
      // Create a custom route with origin and destination
      routeStations = [
        origin,
        "Junction Point",
        "Transfer Station",
        destination
      ];
    }
  }
  
  // Determine current station index based on location or delay
  let currentStationIndex = 0;
  
  // Try to match current location to a station
  const matchedIndex = routeStations.findIndex(station => 
    currentLocation.toLowerCase().includes(station.toLowerCase()) ||
    station.toLowerCase().includes(currentLocation.toLowerCase())
  );
  
  if (matchedIndex !== -1) {
    currentStationIndex = matchedIndex;
  } else {
    // Calculate based on delay (more delay = earlier in journey)
    if (delayMinutes === 0) {
      currentStationIndex = Math.floor(routeStations.length * 0.8); // Near end
    } else if (delayMinutes < 10) {
      currentStationIndex = Math.floor(routeStations.length * 0.6); // Middle-end
    } else if (delayMinutes < 20) {
      currentStationIndex = Math.floor(routeStations.length * 0.4); // Middle
    } else {
      currentStationIndex = Math.floor(routeStations.length * 0.2); // Early
    }
  }
  
  // Generate stations array
  const stations: Station[] = routeStations.map((name, index) => ({
    name,
    position: (index / (routeStations.length - 1)) * 100,
    isPassed: index < currentStationIndex,
    isCurrent: index === currentStationIndex,
  }));
  
  // Calculate progress percentage
  const progress = (currentStationIndex / (routeStations.length - 1)) * 100;
  
  return {
    stations,
    progress,
  };
}
