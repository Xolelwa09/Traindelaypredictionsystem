// Mock service that simulates AI predictions for train delays
// Based on the prototype logic from the specification

interface DelayPrediction {
  trainNumber: string;
  eta: string;
  delayMinutes: number;
  riskLevel: "low" | "medium" | "high";
  cause: string;
  currentLocation?: string;
  alternatives?: Array<{
    type: string;
    name: string;
    waitTime: string;
  }>;
  hasGPSData: boolean;
  hasWeatherData: boolean;
  errorMessage?: string;
}

// Mock train database with predefined scenarios
const trainScenarios: Record<string, DelayPrediction> = {
  "205": {
    trainNumber: "Train 205",
    eta: "09:42 AM",
    delayMinutes: 12,
    riskLevel: "medium",
    cause: "Congestion at Junction Station",
    currentLocation: "Approaching Central Junction",
    alternatives: [
      { type: "bus", name: "Bus 10", waitTime: "3 mins" },
      { type: "train", name: "Express Train 210", waitTime: "8 mins" },
    ],
    hasGPSData: true,
    hasWeatherData: true,
  },
  "450": {
    trainNumber: "Train 450",
    eta: "10:15 AM",
    delayMinutes: 0,
    riskLevel: "low",
    cause: "No delays detected",
    currentLocation: "Platform 5, Main Station",
    alternatives: [],
    hasGPSData: true,
    hasWeatherData: true,
  },
  "132": {
    trainNumber: "Train 132",
    eta: "11:25 AM",
    delayMinutes: 25,
    riskLevel: "high",
    cause: "Severe weather conditions (Heavy rain)",
    currentLocation: "Delayed at North Terminal",
    alternatives: [
      { type: "bus", name: "Bus 10", waitTime: "3 mins" },
      { type: "bus", name: "Bus 22", waitTime: "5 mins" },
    ],
    hasGPSData: true,
    hasWeatherData: true,
  },
  "301": {
    trainNumber: "Train 301",
    eta: "02:20 PM",
    delayMinutes: 8,
    riskLevel: "low",
    cause: "Minor signal delay",
    currentLocation: "West Station",
    alternatives: [
      { type: "train", name: "Train 305", waitTime: "10 mins" },
    ],
    hasGPSData: true,
    hasWeatherData: true,
  },
  "777": {
    trainNumber: "Train 777",
    eta: "03:45 PM",
    delayMinutes: 18,
    riskLevel: "medium",
    cause: "Technical maintenance required",
    currentLocation: "Service Bay 2",
    alternatives: [],
    hasGPSData: false,
    hasWeatherData: true,
    errorMessage: "This train is currently undergoing maintenance checks.",
  },
  "999": {
    trainNumber: "Train 999",
    eta: "05:30 PM",
    delayMinutes: 5,
    riskLevel: "low",
    cause: "Normal operational variance",
    currentLocation: "Route unavailable",
    alternatives: [
      { type: "train", name: "Train 1001", waitTime: "12 mins" },
    ],
    hasGPSData: false,
    hasWeatherData: false,
  },
};

// Function to extract train number from input
function extractTrainNumber(input: string): string {
  // Remove "train" prefix and any non-numeric characters
  const match = input.match(/\d+/);
  return match ? match[0] : "";
}

// Function to generate random delay prediction for unknown trains
function generateRandomPrediction(trainNumber: string): DelayPrediction {
  const delays = [0, 5, 8, 12, 15, 20];
  const causes = [
    "Normal operational variance",
    "Minor congestion",
    "Signal delay",
    "Platform availability",
    "Crew changeover",
  ];
  
  const delayMinutes = delays[Math.floor(Math.random() * delays.length)];
  const now = new Date();
  now.setMinutes(now.getMinutes() + 20 + delayMinutes);
  
  let riskLevel: "low" | "medium" | "high" = "low";
  if (delayMinutes > 10) riskLevel = "medium";
  if (delayMinutes > 18) riskLevel = "high";

  return {
    trainNumber: `Train ${trainNumber}`,
    eta: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    delayMinutes,
    riskLevel,
    cause: delayMinutes === 0 ? "On schedule" : causes[Math.floor(Math.random() * causes.length)],
    currentLocation: "En route",
    alternatives: delayMinutes > 10 ? [
      { type: "train", name: `Train ${parseInt(trainNumber) + 5}`, waitTime: "15 mins" }
    ] : [],
    hasGPSData: Math.random() > 0.3,
    hasWeatherData: Math.random() > 0.2,
  };
}

// Main prediction function
export async function predictTrainDelay(input: string, destination?: string): Promise<DelayPrediction> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2500));

  const trainNumber = extractTrainNumber(input);

  // Validate train number (must be between 100 and 999)
  if (!trainNumber) {
    throw new Error("Invalid train number format. Please enter a valid train number.");
  }

  const trainNum = parseInt(trainNumber);
  if (trainNum < 100 || trainNum > 999) {
    throw new Error("Invalid train number. Please enter a train number between 100 and 999.");
  }

  // Check if we have a predefined scenario
  if (trainScenarios[trainNumber]) {
    const prediction = { ...trainScenarios[trainNumber] };
    
    // Calculate arrival time if destination is provided
    if (destination) {
      prediction.eta = calculateArrivalTime(prediction.delayMinutes, destination);
    }
    
    return prediction;
  }

  // Generate random prediction for unknown trains
  const prediction = generateRandomPrediction(trainNumber);
  
  // Calculate arrival time if destination is provided
  if (destination) {
    prediction.eta = calculateArrivalTime(prediction.delayMinutes, destination);
  }
  
  return prediction;
}

// Calculate arrival time based on destination and delay
function calculateArrivalTime(delayMinutes: number, destination: string): string {
  // Base travel times to different destinations (in minutes)
  const baseTravelTimes: Record<string, number> = {
    "durban station": 15,
    "umhlanga": 25,
    "phoenix": 35,
    "chatsworth": 30,
    "pinetown": 20,
    "westville": 18,
    "queensburgh": 22,
    "kwamashu": 40,
    "umlazi": 35,
    "isipingo": 28,
    // Additional generic stations
    "central station": 15,
    "north station": 25,
    "south station": 30,
    "east station": 20,
    "west station": 22,
    "airport": 35,
    "city center": 15,
    "suburb": 25,
  };

  // Get base travel time or default to 20 minutes
  const destinationKey = destination.toLowerCase();
  const baseTravelTime = baseTravelTimes[destinationKey] || 20;
  
  // Calculate ETA
  const now = new Date();
  now.setMinutes(now.getMinutes() + baseTravelTime + delayMinutes);
  
  return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// Route to train mappings
const routeMappings: Record<string, string[]> = {
  // Route format: "origin-destination" -> array of possible trains
  "durban station-umhlanga": ["205"],
  "durban station-phoenix": ["450"],
  "durban station-chatsworth": ["132"],
  "durban station-pinetown": ["301"],
  "umhlanga-durban station": ["205"],
  "phoenix-durban station": ["450"],
  "chatsworth-durban station": ["132"],
  "pinetown-durban station": ["301"],
  "westville-durban station": ["205"],
  "queensburgh-durban station": ["450"],
  "kwamashu-durban station": ["132"],
  "umlazi-durban station": ["301"],
  "isipingo-durban station": ["205"],
  // Additional generic routes
  "central station-north station": ["205"],
  "central station-south station": ["450"],
  "central station-east station": ["132"],
  "central station-west station": ["301"],
  "central station-airport": ["205"],
};

// Function to normalize station names for matching
function normalizeStationName(name: string): string {
  return name.toLowerCase().trim();
}

// Function to find trains that match a route
function findTrainsByRoute(origin: string, destination: string): string[] {
  const normalizedOrigin = normalizeStationName(origin);
  const normalizedDestination = normalizeStationName(destination);
  const routeKey = `${normalizedOrigin}-${normalizedDestination}`;
  
  // Check direct match
  if (routeMappings[routeKey]) {
    return routeMappings[routeKey];
  }
  
  // Check partial matches in route key
  const matchingRoutes = Object.keys(routeMappings).filter(key => {
    const [routeOrigin, routeDestination] = key.split('-');
    return (
      routeOrigin.includes(normalizedOrigin) || normalizedOrigin.includes(routeOrigin)
    ) && (
      routeDestination.includes(normalizedDestination) || normalizedDestination.includes(routeDestination)
    );
  });
  
  if (matchingRoutes.length > 0) {
    return routeMappings[matchingRoutes[0]];
  }
  
  // If no match found, return a generic train
  return ["301"];
}

// Main prediction function by route
export async function predictTrainDelayByRoute(
  origin: string,
  destination: string
): Promise<DelayPrediction> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  if (!origin.trim() || !destination.trim()) {
    throw new Error("Please enter both origin and destination stations.");
  }
  
  // Find trains that service this route
  const matchingTrains = findTrainsByRoute(origin, destination);
  
  // Get the first matching train's prediction
  const trainNumber = matchingTrains[0];
  
  if (trainScenarios[trainNumber]) {
    const prediction = {
      ...trainScenarios[trainNumber],
      currentLocation: `En route from ${origin} to ${destination}`,
    };
    
    // Calculate arrival time for destination
    prediction.eta = calculateArrivalTime(prediction.delayMinutes, destination);
    
    return prediction;
  }
  
  // Generate a prediction for this route
  const prediction = generateRandomPrediction(trainNumber);
  prediction.eta = calculateArrivalTime(prediction.delayMinutes, destination);
  
  return {
    ...prediction,
    currentLocation: `En route from ${origin} to ${destination}`,
  };
}

// Export list of available stations
export const availableStations = [
  "Durban Station",
  "Umhlanga",
  "Phoenix",
  "Chatsworth",
  "Pinetown",
  "Westville",
  "Queensburgh",
  "KwaMashu",
  "Umlazi",
  "Isipingo",
  "Central Station",
  "North Station",
  "South Station",
  "East Station",
  "West Station",
  "Airport",
  "City Center",
  "Suburb",
];

// Keep durbanStations export for backwards compatibility
export const durbanStations = availableStations;

// Export scenarios for testing
export { trainScenarios };
