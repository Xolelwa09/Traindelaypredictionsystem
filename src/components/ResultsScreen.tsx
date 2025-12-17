import { Train, Clock, AlertCircle, Cloud, MapPin, Bus, ArrowRight, RefreshCw } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { TrainMapView } from "./TrainMapView";
import { NotificationPanel } from "./NotificationPanel";
import { generateMapData } from "../utils/mapDataService";

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

interface ResultsScreenProps {
  prediction: DelayPrediction;
  onReset: () => void;
  onNavigateToBusStops: () => void;
}

export function ResultsScreen({ prediction, onReset, onNavigateToBusStops }: ResultsScreenProps) {
  
  const riskConfig = {
    low: {
      color: "bg-green-100 text-green-800 border-green-300",
      label: "Low Risk",
      icon: "✓",
    },
    medium: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      label: "Medium Risk",
      icon: "⚠",
    },
    high: {
      color: "bg-red-100 text-red-800 border-red-300",
      label: "High Risk",
      icon: "⚠",
    },
  };

  const config = riskConfig[prediction.riskLevel];
  
  // Generate map data
  const mapData = generateMapData(
    prediction.trainNumber,
    prediction.currentLocation || "",
    prediction.delayMinutes
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#9b87d4] rounded-full flex items-center justify-center">
              <Train className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-blue-900">Train Delay Prediction</h1>
              <p className="text-sm text-gray-600">{prediction.trainNumber}</p>
            </div>
          </div>
          <Button onClick={onReset} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            New Search
          </Button>
        </div>

        {/* Error Notifications */}
        {prediction.errorMessage && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-amber-900">{prediction.errorMessage}</p>
              </div>
            </div>
          </Card>
        )}

        {!prediction.hasGPSData && (
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-orange-900">⚠️ Live tracking unavailable — using historical data.</p>
              </div>
            </div>
          </Card>
        )}

        {!prediction.hasWeatherData && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Cloud className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-900">🌦️ Weather data unavailable — prediction accuracy may be reduced.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Notification Panel */}
        <NotificationPanel
          trainNumber={prediction.trainNumber}
          delayMinutes={prediction.delayMinutes}
          eta={prediction.eta}
        />

        {/* Main Prediction Card */}
        <Card className="p-6 shadow-lg">
          <div className="grid md:grid-cols-2 gap-6">
            {/* ETA Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Predicted Arrival Time</span>
              </div>
              <div className="text-5xl text-blue-900">{prediction.eta}</div>
              {prediction.delayMinutes > 0 && (
                <p className="text-red-600">
                  Delayed by {prediction.delayMinutes} minutes
                </p>
              )}
              {prediction.delayMinutes === 0 && (
                <p className="text-green-600">✓ On Time</p>
              )}
            </div>

            {/* Risk Level Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <AlertCircle className="w-5 h-5" />
                <span>Delay Risk Assessment</span>
              </div>
              <div>
                <Badge className={`${config.color} px-4 py-2 text-lg border`}>
                  {config.icon} {config.label}
                </Badge>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-600 mb-1">Delay Cause:</p>
                <p className="text-gray-900">{prediction.cause}</p>
              </div>
            </div>
          </div>

          {/* Current Location */}
          {prediction.currentLocation && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600">Current Location:</span>
                <span className="text-gray-900">{prediction.currentLocation}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Alternative Options */}
        {prediction.delayMinutes > 0 && (
          <Card className="p-6 shadow-lg">
            <h3 className="mb-4 text-gray-900">Alternate Options</h3>
            <div className="space-y-3">
              {prediction.alternatives && prediction.alternatives.length > 0 && prediction.alternatives.map((alt, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {alt.type === "train" && <Train className="w-5 h-5 text-blue-600" />}
                  {alt.type === "bus" && <Bus className="w-5 h-5 text-green-600" />}
                  <div>
                    <p className="text-gray-900">{alt.name}</p>
                    <p className="text-sm text-gray-600">Available in {alt.waitTime}</p>
                  </div>
                </div>
              ))}
              
              {/* Nearby Bus Stops Button */}
              <button
                onClick={prediction.alternatives && prediction.alternatives.some(alt => alt.type === "bus") ? onNavigateToBusStops : undefined}
                disabled={!(prediction.alternatives && prediction.alternatives.some(alt => alt.type === "bus"))}
                className={`w-full flex items-center justify-between p-4 rounded-lg transition-all border-2 ${
                  prediction.alternatives && prediction.alternatives.some(alt => alt.type === "bus")
                    ? "bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-green-200 cursor-pointer"
                    : "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    prediction.alternatives && prediction.alternatives.some(alt => alt.type === "bus")
                      ? "bg-green-600"
                      : "bg-gray-400"
                  }`}>
                    <Bus className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900">Nearby Bus Stops</p>
                    <p className="text-sm text-gray-600">
                      {prediction.alternatives && prediction.alternatives.some(alt => alt.type === "bus")
                        ? "Find alternative bus transportation"
                        : "No alternative bus transportation is available in this area"}
                    </p>
                  </div>
                </div>
                {prediction.alternatives && prediction.alternatives.some(alt => alt.type === "bus") && (
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </Card>
        )}

        {prediction.alternatives && prediction.alternatives.length === 0 && prediction.delayMinutes > 10 && (
          <Card className="p-4 bg-gray-50 border-gray-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-gray-900">❗ No faster option available — next train in 15 mins.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Map Visualization */}
        {prediction.currentLocation && (
          <TrainMapView
            trainNumber={prediction.trainNumber}
            currentLocation={prediction.currentLocation}
            progress={mapData.progress}
            stations={mapData.stations}
            delayMinutes={prediction.delayMinutes}
          />
        )}

        {/* Data Sources */}
        <Card className="p-4 bg-blue-50">
          <p className="text-sm text-gray-600 mb-2">Data sources:</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white">GPS Tracking</Badge>
            <Badge variant="secondary" className="bg-white">Weather API</Badge>
            <Badge variant="secondary" className="bg-white">AI Prediction Model</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
