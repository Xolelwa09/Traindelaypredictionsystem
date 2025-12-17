import { MapPin, Circle } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";

interface Station {
  name: string;
  position: number; // 0-100 percentage along route
  isPassed: boolean;
  isCurrent: boolean;
}

interface TrainMapViewProps {
  trainNumber: string;
  currentLocation: string;
  progress: number; // 0-100 percentage of journey completed
  stations: Station[];
  delayMinutes: number;
}

export function TrainMapView({
  trainNumber,
  currentLocation,
  progress,
  stations,
  delayMinutes,
}: TrainMapViewProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900">Live Route Map</h3>
        <Badge variant="secondary" className="gap-1">
          <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
          Live Tracking
        </Badge>
      </div>

      <div className="relative">
        {/* Route Line */}
        <div className="absolute left-8 top-8 bottom-8 w-1 bg-gray-200 rounded-full" />
        
        {/* Progress Line */}
        <motion.div
          className="absolute left-8 top-8 w-1 bg-gradient-to-b from-green-500 to-blue-500 rounded-full origin-top"
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ maxHeight: "calc(100% - 4rem)" }}
        />

        {/* Stations */}
        <div className="space-y-6 relative">
          {stations.map((station, index) => (
            <div
              key={index}
              className="flex items-start gap-4 relative"
              style={{ minHeight: "60px" }}
            >
              {/* Station Marker */}
              <div className="relative z-10 flex-shrink-0">
                {station.isCurrent ? (
                  <motion.div
                    className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-blue-200"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <MapPin className="w-4 h-4 text-white" />
                  </motion.div>
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      station.isPassed
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {station.isPassed ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Circle className="w-3 h-3" />
                    )}
                  </div>
                )}
              </div>

              {/* Station Info */}
              <div className="flex-1 pt-1">
                <p
                  className={`${
                    station.isCurrent
                      ? "text-blue-900"
                      : station.isPassed
                      ? "text-gray-700"
                      : "text-gray-500"
                  }`}
                >
                  {station.name}
                </p>
                {station.isCurrent && (
                  <div className="mt-1 space-y-1">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      Current Location
                    </Badge>
                    {delayMinutes > 0 && (
                      <p className="text-sm text-red-600">
                        {delayMinutes} min delay
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Estimated Time */}
              <div className="text-sm text-gray-500 pt-1">
                {station.isPassed ? "Passed" : station.isCurrent ? "Now" : "Upcoming"}
              </div>
            </div>
          ))}
        </div>

        {/* Train Icon Animation */}
        <motion.div
          className="absolute left-2 pointer-events-none"
          initial={{ top: "2rem" }}
          animate={{ top: `calc(${progress}% - 1rem + 2rem)` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ maxTop: "calc(100% - 2rem)" }}
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Journey Progress</span>
          <span className="text-gray-900">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </Card>
  );
}
