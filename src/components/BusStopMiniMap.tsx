import { MapPin, Navigation, Route } from "lucide-react";
import { motion } from "motion/react";
import type { BusStop } from "../utils/busStopService";

interface BusStopMiniMapProps {
  busStops: BusStop[];
  userLocation: { latitude: number; longitude: number };
  onGetDirections?: (busStop: BusStop) => void;
}

export function BusStopMiniMap({ busStops, userLocation, onGetDirections }: BusStopMiniMapProps) {
  if (busStops.length === 0) return null;

  // Calculate bounds for the map
  const allLats = [userLocation.latitude, ...busStops.map((s) => s.latitude)];
  const allLons = [userLocation.longitude, ...busStops.map((s) => s.longitude)];
  const minLat = Math.min(...allLats);
  const maxLat = Math.max(...allLats);
  const minLon = Math.min(...allLons);
  const maxLon = Math.max(...allLons);

  // Add padding
  const latPadding = (maxLat - minLat) * 0.2 || 0.01;
  const lonPadding = (maxLon - minLon) * 0.2 || 0.01;

  // Convert lat/lon to pixel coordinates
  const toPixel = (lat: number, lon: number) => {
    const x = ((lon - (minLon - lonPadding)) / ((maxLon + lonPadding) - (minLon - lonPadding))) * 100;
    const y = (1 - (lat - (minLat - latPadding)) / ((maxLat + latPadding) - (minLat - latPadding))) * 100;
    return { x, y };
  };

  const userPos = toPixel(userLocation.latitude, userLocation.longitude);

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden border-2 border-gray-200">
      {/* Grid lines for visual effect */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${i * 25}%` }} />
        ))}
        {[...Array(5)].map((_, i) => (
          <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${i * 25}%` }} />
        ))}
      </div>

      {/* User Location */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute"
        style={{
          left: `${userPos.x}%`,
          top: `${userPos.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-blue-200">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs bg-white px-2 py-0.5 rounded shadow-sm border border-blue-300">
              You
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bus Stops */}
      {busStops.map((stop, index) => {
        const pos = toPixel(stop.latitude, stop.longitude);
        return (
          <motion.div
            key={stop.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="absolute group cursor-pointer"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Connection Line */}
            <svg
              className="absolute pointer-events-none"
              style={{
                left: "50%",
                top: "50%",
                width: "200%",
                height: "200%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <line
                x1="50%"
                y1="50%"
                x2={`${((userPos.x - pos.x) / 2 + 50)}%`}
                y2={`${((userPos.y - pos.y) / 2 + 50)}%`}
                stroke={index === 0 ? "#16a34a" : "#94a3b8"}
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity="0.5"
              />
            </svg>

            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all group-hover:scale-125 ${
                index === 0
                  ? "bg-green-600 ring-2 ring-green-300"
                  : "bg-orange-500 ring-2 ring-orange-300"
              }`}
            >
              <MapPin className="w-3 h-3 text-white" />
            </div>

            {/* Tooltip with Directions Button */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-auto">
              <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap">
                <p className="text-xs text-gray-900">{stop.name}</p>
                <p className="text-xs text-gray-600 mt-0.5 mb-2">
                  {stop.distance < 1000
                    ? `${stop.distance}m`
                    : `${(stop.distance / 1000).toFixed(1)}km`} • {stop.estimatedWalkTime}
                </p>
                {onGetDirections && (
                  <button
                    onClick={() => onGetDirections(stop)}
                    className="w-full text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <Route className="w-3 h-3" />
                    Directions
                  </button>
                )}
              </div>
            </div>

            {/* Distance Label */}
            {index === 0 && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded shadow-sm">
                  Closest
                </span>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <span className="text-gray-700">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full" />
            <span className="text-gray-700">Nearest Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-700">Other Stops</span>
          </div>
        </div>
      </div>
    </div>
  );
}
