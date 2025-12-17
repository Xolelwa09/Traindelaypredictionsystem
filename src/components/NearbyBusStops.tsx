import { useState, useEffect } from "react";
import { Bus, MapPin, Navigation, Loader2, Clock, AlertCircle, Map } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion, AnimatePresence } from "motion/react";
import {
  getNearbyBusStops,
  getUserLocation,
  requestUserLocation,
  type BusStop,
} from "../utils/busStopService";
import { BusStopMiniMap } from "./BusStopMiniMap";
import { DirectionsView } from "./DirectionsView";
import { getDirectionsToBusStop, type RouteDirections } from "../utils/directionsService";
import { toast } from "sonner@2.0.3";

interface NearbyBusStopsProps {
  isVisible?: boolean;
}

export function NearbyBusStops({ isVisible = true }: NearbyBusStopsProps) {
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [hasRequested, setHasRequested] = useState(false);
  const [selectedBusStop, setSelectedBusStop] = useState<BusStop | null>(null);
  const [directions, setDirections] = useState<RouteDirections | null>(null);
  const [loadingDirections, setLoadingDirections] = useState(false);

  const fetchNearbyStops = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const stops = await getNearbyBusStops(lat, lon, 5);
      setBusStops(stops);
      toast.success(`Found ${stops.length} nearby bus stops`);
    } catch (err) {
      setError("Failed to fetch nearby bus stops");
      toast.error("Failed to fetch nearby bus stops");
    } finally {
      setLoading(false);
    }
  };

  const handleFindNearbyStops = async () => {
    setHasRequested(true);
    setLoading(true);
    setError(null);

    try {
      // Try to get real user location first
      const position = await requestUserLocation();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setUserLocation({ latitude: lat, longitude: lon });
      await fetchNearbyStops(lat, lon);
    } catch (err) {
      // Fall back to mock location (silently for demo purposes)
      toast.info("Using approximate location for demo");
      const mockLocation = await getUserLocation();
      setUserLocation(mockLocation);
      await fetchNearbyStops(mockLocation.latitude, mockLocation.longitude);
    }
  };

  const handleGetDirections = async (busStop: BusStop) => {
    if (!userLocation) {
      toast.error("User location not available");
      return;
    }

    setLoadingDirections(true);
    setSelectedBusStop(busStop);

    try {
      const routeDirections = await getDirectionsToBusStop(
        userLocation.latitude,
        userLocation.longitude,
        busStop.latitude,
        busStop.longitude,
        busStop.name,
        busStop.distance
      );
      setDirections(routeDirections);
      toast.success("Directions loaded successfully");
    } catch (err) {
      toast.error("Failed to load directions");
      setSelectedBusStop(null);
    } finally {
      setLoadingDirections(false);
    }
  };

  const handleCloseDirections = () => {
    setSelectedBusStop(null);
    setDirections(null);
  };

  if (!isVisible) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">Nearby Bus Stops</h3>
            <p className="text-sm text-gray-600">
              Alternative transportation options
            </p>
          </div>
        </div>
        {!hasRequested && (
          <Button
            onClick={handleFindNearbyStops}
            className="gap-2 bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            <Navigation className="w-4 h-4" />
            Find Stops
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Finding nearby bus stops...</p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-900">{error}</p>
                <Button
                  onClick={handleFindNearbyStops}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {busStops.length > 0 && !loading && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {userLocation && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>
                  Showing stops near your location ({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})
                </span>
              </div>
            )}

            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="list" className="gap-2">
                  <Bus className="w-4 h-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map" className="gap-2">
                  <Map className="w-4 h-4" />
                  Map View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="mt-0">
                {userLocation && (
                  <BusStopMiniMap 
                    busStops={busStops} 
                    userLocation={userLocation}
                    onGetDirections={handleGetDirections}
                  />
                )}
              </TabsContent>

              <TabsContent value="list" className="space-y-3 mt-0">
                {busStops.map((stop, index) => (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-gray-900">{stop.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {index === 0 ? "Closest" : `#${index + 1}`}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{stop.address}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-900">
                      {stop.distance < 1000
                        ? `${stop.distance}m`
                        : `${(stop.distance / 1000).toFixed(1)}km`}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{stop.estimatedWalkTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  <span className="text-xs text-gray-600 mr-1">Routes:</span>
                  {stop.routes.map((route) => (
                    <Badge
                      key={route}
                      variant="outline"
                      className="text-xs bg-green-50 border-green-300 text-green-700"
                    >
                      <Bus className="w-3 h-3 mr-1" />
                      {route}
                    </Badge>
                  ))}
                </div>

                <Button
                  size="sm"
                  className="w-full mt-3 bg-green-600 hover:bg-green-700 gap-2"
                  onClick={() => handleGetDirections(stop)}
                  disabled={loadingDirections}
                >
                  {loadingDirections && selectedBusStop?.id === stop.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </>
                  )}
                </Button>
              </motion.div>
            ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleFindNearbyStops}
                >
                  <Navigation className="w-4 h-4" />
                  Refresh Location
                </Button>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {!hasRequested && !loading && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Navigation className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600 mb-4">
              Find bus stops near your current location
            </p>
            <p className="text-sm text-gray-500">
              We'll use your location to show the nearest stops
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directions Modal */}
      <AnimatePresence>
        {directions && selectedBusStop && userLocation && (
          <DirectionsView
            directions={directions}
            busStop={selectedBusStop}
            userLocation={userLocation}
            onClose={handleCloseDirections}
          />
        )}
      </AnimatePresence>
    </Card>
  );
}
