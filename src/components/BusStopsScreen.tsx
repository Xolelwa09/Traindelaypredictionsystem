import { ArrowLeft, Bus, Train } from "lucide-react";
import { Button } from "./ui/button";
import { NearbyBusStops } from "./NearbyBusStops";

interface BusStopsScreenProps {
  trainNumber: string;
  onBack: () => void;
}

export function BusStopsScreen({ trainNumber, onBack }: BusStopsScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-blue-900">Nearby Bus Stops</h1>
              <p className="text-sm text-gray-600">Alternative transportation for Train {trainNumber}</p>
            </div>
          </div>
          <Button onClick={onBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </Button>
        </div>

        {/* Bus Stops Component */}
        <NearbyBusStops isVisible={true} />
      </div>
    </div>
  );
}
