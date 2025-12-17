import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Navigation,
  Clock,
  Footprints,
  X,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import type { RouteDirections, DirectionStep } from "../utils/directionsService";
import type { BusStop } from "../utils/busStopService";
import { toast } from "sonner@2.0.3";

interface DirectionsViewProps {
  directions: RouteDirections;
  busStop: BusStop;
  userLocation: { latitude: number; longitude: number };
  onClose: () => void;
}

const DirectionIcon = ({ type }: { type: DirectionStep["icon"] }) => {
  switch (type) {
    case "left":
      return <ArrowLeft className="w-5 h-5" />;
    case "right":
      return <ArrowRight className="w-5 h-5" />;
    case "arrive":
      return <MapPin className="w-5 h-5 text-green-600" />;
    default:
      return <ArrowUp className="w-5 h-5" />;
  }
};

export function DirectionsView({
  directions,
  busStop,
  userLocation,
  onClose,
}: DirectionsViewProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-advance steps during navigation
  useEffect(() => {
    if (!isNavigating) return;

    const stepDuration = 3000; // 3 seconds per step for demo
    const progressInterval = 50; // Update every 50ms
    const progressIncrement = (100 / (stepDuration / progressInterval));

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next step
          setCurrentStepIndex((stepIndex) => {
            if (stepIndex < directions.steps.length - 1) {
              toast.success(directions.steps[stepIndex + 1].instruction);
              return stepIndex + 1;
            } else {
              // Reached destination
              setIsNavigating(false);
              toast.success("🎉 You've arrived at your destination!");
              return stepIndex;
            }
          });
          return 0;
        }
        return prev + progressIncrement;
      });
    }, progressInterval);

    return () => clearInterval(interval);
  }, [isNavigating, currentStepIndex, directions.steps]);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setCurrentStepIndex(0);
    setProgress(0);
    toast.success("Navigation started!");
  };

  const handlePauseNavigation = () => {
    setIsNavigating(false);
    toast.info("Navigation paused");
  };

  // Convert route points to map coordinates
  const routePoints = directions.routePoints;
  const allLats = routePoints.map((p) => p.latitude);
  const allLons = routePoints.map((p) => p.longitude);
  const minLat = Math.min(...allLats);
  const maxLat = Math.max(...allLats);
  const minLon = Math.min(...allLons);
  const maxLon = Math.max(...allLons);

  const latPadding = (maxLat - minLat) * 0.15 || 0.005;
  const lonPadding = (maxLon - minLon) * 0.15 || 0.005;

  const toPixel = (lat: number, lon: number) => {
    const x =
      ((lon - (minLon - lonPadding)) /
        (maxLon + lonPadding - (minLon - lonPadding))) *
      100;
    const y =
      (1 -
        (lat - (minLat - latPadding)) /
          (maxLat + latPadding - (minLat - latPadding))) *
      100;
    return { x, y };
  };

  // Generate SVG path from route points
  const pathPoints = routePoints.map((p) => toPixel(p.latitude, p.longitude));
  const pathString = pathPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const startPos = toPixel(userLocation.latitude, userLocation.longitude);
  const endPos = toPixel(busStop.latitude, busStop.longitude);

  // Calculate current position along the route during navigation
  const getCurrentPosition = () => {
    if (!isNavigating || currentStepIndex >= routePoints.length) {
      return startPos;
    }
    
    // Interpolate between current step and next step based on progress
    const currentPoint = routePoints[Math.min(currentStepIndex, routePoints.length - 1)];
    const nextPoint = routePoints[Math.min(currentStepIndex + 1, routePoints.length - 1)];
    
    const currentPos = toPixel(currentPoint.latitude, currentPoint.longitude);
    const nextPos = toPixel(nextPoint.latitude, nextPoint.longitude);
    
    // Linear interpolation based on progress
    const progressFraction = progress / 100;
    return {
      x: currentPos.x + (nextPos.x - currentPos.x) * progressFraction,
      y: currentPos.y + (nextPos.y - currentPos.y) * progressFraction,
    };
  };

  const currentPosition = getCurrentPosition();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="mb-2">Walking Directions</h2>
              <p className="text-blue-100">To {busStop.name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Footprints className="w-5 h-5" />
              <div>
                <p className="text-sm text-blue-100">Distance</p>
                <p>{directions.totalDistance}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <div>
                <p className="text-sm text-blue-100">Est. Time</p>
                <p>{directions.totalDuration}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0 h-[calc(90vh-180px)]">
          {/* Map View */}
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 p-6 border-r overflow-auto">
            <div className="relative w-full h-full min-h-[400px] bg-white rounded-lg overflow-hidden border-2 border-gray-200">
              {/* Grid background */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute w-full h-px bg-gray-400"
                    style={{ top: `${i * 10}%` }}
                  />
                ))}
                {[...Array(10)].map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute h-full w-px bg-gray-400"
                    style={{ left: `${i * 10}%` }}
                  />
                ))}
              </div>

              {/* Route Path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {/* Base route line */}
                <motion.path
                  d={pathString}
                  fill="none"
                  stroke={isNavigating ? "#d1d5db" : "#3b82f6"}
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                
                {/* Completed route portion (green) during navigation */}
                {isNavigating && currentStepIndex > 0 && (
                  <motion.path
                    d={pathPoints
                      .slice(0, Math.min(currentStepIndex + 1, pathPoints.length))
                      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                      .join(" ")}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                
                {/* Route overlay for thickness */}
                {!isNavigating && (
                  <path
                    d={pathString}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                )}
              </svg>

              {/* Start Point */}
              {!isNavigating && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute"
                  style={{
                    left: `${startPos.x}%`,
                    top: `${startPos.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-blue-200">
                      <Navigation className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <Badge className="bg-blue-600 text-xs">Start</Badge>
                  </div>
                </motion.div>
              )}

              {/* Current Position During Navigation */}
              {isNavigating && (
                <motion.div
                  className="absolute"
                  animate={{
                    left: `${currentPosition.x}%`,
                    top: `${currentPosition.y}%`,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Pulsing outer ring */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-full" />
                  </motion.div>
                  
                  {/* Main position marker */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white border-2 border-blue-400">
                      <Navigation className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>
                  
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <Badge className="bg-blue-600 text-xs shadow-lg">You are here</Badge>
                  </div>
                </motion.div>
              )}

              {/* End Point */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 }}
                className="absolute"
                style={{
                  left: `${endPos.x}%`,
                  top: `${endPos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                >
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-green-200">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <Badge className="bg-green-600 text-xs">Bus Stop</Badge>
                </div>
              </motion.div>

              {/* Intermediate points */}
              {pathPoints.slice(1, -1).map((point, index) => {
                const pointIndex = index + 1; // Actual index in pathPoints
                const isCompleted = isNavigating && pointIndex < currentStepIndex;
                const isCurrent = isNavigating && pointIndex === currentStepIndex;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: isCurrent ? [1, 1.5, 1] : 1,
                    }}
                    transition={{ 
                      delay: 0.7 + index * 0.1,
                      ...(isCurrent && { repeat: Infinity, duration: 1 })
                    }}
                    className={`absolute rounded-full ${
                      isCompleted 
                        ? "w-3 h-3 bg-green-500 ring-2 ring-green-200" 
                        : isCurrent
                        ? "w-3 h-3 bg-blue-600 ring-2 ring-blue-200"
                        : "w-2 h-2 bg-blue-400"
                    }`}
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Turn-by-turn directions */}
          <div className="relative overflow-hidden h-full">
            <ScrollArea className="h-full">
              <div className="p-6">
              {/* Live Navigation Header */}
              {isNavigating && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-blue-600 text-white rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 animate-pulse" />
                      <span>Live Navigation</span>
                    </div>
                    <Badge className="bg-white text-blue-600">
                      Step {currentStepIndex + 1} of {directions.steps.length}
                    </Badge>
                  </div>
                  <p className="text-xl mb-2">
                    {directions.steps[currentStepIndex].instruction}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <ChevronRight className="w-4 h-4" />
                      <span>{directions.steps[currentStepIndex].distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{directions.steps[currentStepIndex].duration}</span>
                    </div>
                  </div>
                  <Progress value={progress} className="mt-3 h-2 bg-blue-400" />
                </motion.div>
              )}

              <h3 className="mb-4 text-gray-900">Turn-by-Turn Directions</h3>
              <div className="space-y-1">
                {directions.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: isNavigating && index === currentStepIndex ? 1.02 : 1
                    }}
                    transition={{ delay: 0.1 * index }}
                    className={`relative pl-12 pb-6 ${
                      index === directions.steps.length - 1 ? "pb-0" : ""
                    } ${
                      isNavigating && index === currentStepIndex 
                        ? "bg-blue-50 -mx-2 px-2 py-2 rounded-lg" 
                        : ""
                    } ${
                      isNavigating && index < currentStepIndex
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    {/* Timeline connector */}
                    {index < directions.steps.length - 1 && (
                      <div className={`absolute left-[18px] top-10 bottom-0 w-0.5 ${
                        isNavigating && index < currentStepIndex ? "bg-green-400" : "bg-gray-200"
                      }`} />
                    )}

                    {/* Step icon */}
                    <div
                      className={`absolute left-0 top-0 w-9 h-9 rounded-full flex items-center justify-center ${
                        isNavigating && index < currentStepIndex
                          ? "bg-green-500 text-white"
                          : isNavigating && index === currentStepIndex
                          ? "bg-blue-600 text-white ring-4 ring-blue-200"
                          : step.icon === "arrive"
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {isNavigating && index < currentStepIndex ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          ✓
                        </motion.div>
                      ) : (
                        <DirectionIcon type={step.icon} />
                      )}
                    </div>

                    {/* Step content */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`${
                          isNavigating && index === currentStepIndex 
                            ? "text-blue-900" 
                            : "text-gray-900"
                        }`}>
                          {step.instruction}
                        </p>
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {step.distance}
                        </Badge>
                      </div>
                      {step.streetName && (
                        <p className="text-sm text-gray-600 mb-1">
                          via {step.streetName}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{step.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bus Routes Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700 mb-2">
                  Available routes at this stop:
                </p>
                <div className="flex flex-wrap gap-2">
                  {busStop.routes.map((route) => (
                    <Badge
                      key={route}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Bus {route}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {!isNavigating ? (
                  <Button 
                    className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                    onClick={handleStartNavigation}
                  >
                    <Play className="w-4 h-4" />
                    Start Navigation
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 gap-2 bg-orange-600 hover:bg-orange-700"
                    onClick={handlePauseNavigation}
                  >
                    <Pause className="w-4 h-4" />
                    Pause Navigation
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
