import { Train, Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { durbanStations } from "../utils/trainPredictionService";

interface WelcomeScreenProps {
  trainNumber: string;
  onTrainNumberChange: (value: string) => void;
  originStation: string;
  onOriginChange: (value: string) => void;
  destinationStation: string;
  onDestinationChange: (value: string) => void;
  onSubmit: (searchType: "train" | "route") => void;
}

export function WelcomeScreen({ 
  trainNumber, 
  onTrainNumberChange, 
  originStation,
  onOriginChange,
  destinationStation,
  onDestinationChange,
  onSubmit 
}: WelcomeScreenProps) {
  const [searchType, setSearchType] = useState<"train" | "route">("train");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === "train" && trainNumber.trim()) {
      onSubmit("train");
    } else if (searchType === "route" && originStation.trim() && destinationStation.trim()) {
      onSubmit("route");
    }
  };

  const isFormValid = searchType === "train" 
    ? trainNumber.trim() !== ""
    : originStation.trim() !== "" && destinationStation.trim() !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#9b87d4] rounded-full mb-4">
            <Train className="w-10 h-10 text-white" />
          </div>
          <h1 className="mb-2 text-blue-900">Smart Train Delay Predictor</h1>
          <p className="text-gray-600">
            Get real-time delay predictions powered by AI analytics
          </p>
        </div>

        <Tabs value={searchType} onValueChange={(v) => setSearchType(v as "train" | "route")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="train" className="gap-2">
              <Train className="w-4 h-4" />
              Train Number
            </TabsTrigger>
            <TabsTrigger value="route" className="gap-2">
              <MapPin className="w-4 h-4" />
              By Route
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="train" className="space-y-6 mt-0">
              <div>
                <label htmlFor="trainNumber" className="block mb-2 text-gray-700">
                  Enter Train Number (100-999)
                </label>
                <div className="relative">
                  <Input
                    id="trainNumber"
                    type="text"
                    placeholder="e.g., Train 205, Train 450, Train 132"
                    value={trainNumber}
                    onChange={(e) => onTrainNumberChange(e.target.value)}
                    className="pl-4 pr-12 py-6 text-lg"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div>
                <label htmlFor="trainDestination" className="block mb-2 text-gray-700">
                  Your Destination (Optional)
                </label>
                <Select value={destinationStation} onValueChange={onDestinationChange}>
                  <SelectTrigger className="py-6 text-lg">
                    <SelectValue placeholder="Select your destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {durbanStations.map((station) => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Helps us calculate accurate arrival time
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Quick examples:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Train 205", "Train 450", "Train 132"].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => onTrainNumberChange(example)}
                      className="px-4 py-2 bg-white hover:bg-gray-100 rounded-full text-sm text-gray-700 transition-colors border border-gray-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="route" className="space-y-6 mt-0">
              <div>
                <label htmlFor="origin" className="block mb-2 text-gray-700">
                  From (Origin Station)
                </label>
                <Select value={originStation} onValueChange={onOriginChange}>
                  <SelectTrigger className="py-6 text-lg">
                    <SelectValue placeholder="Select origin station" />
                  </SelectTrigger>
                  <SelectContent>
                    {durbanStations.map((station) => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>

              <div>
                <label htmlFor="destination" className="block mb-2 text-gray-700">
                  To (Destination Station)
                </label>
                <Select value={destinationStation} onValueChange={onDestinationChange}>
                  <SelectTrigger className="py-6 text-lg">
                    <SelectValue placeholder="Select destination station" />
                  </SelectTrigger>
                  <SelectContent>
                    {durbanStations
                      .filter(station => station !== originStation)
                      .map((station) => (
                        <SelectItem key={station} value={station}>
                          {station}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Popular routes:
                </p>
                <div className="space-y-2">
                  {[
                    { from: "Central Station", to: "Airport" },
                    { from: "Durban Station", to: "Umhlanga" },
                    { from: "Central Station", to: "North Station" }
                  ].map((route, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        onOriginChange(route.from);
                        onDestinationChange(route.to);
                      }}
                      className="w-full px-4 py-3 bg-white hover:bg-gray-100 rounded-lg text-sm text-left text-gray-700 transition-colors border border-gray-200 flex items-center gap-2"
                    >
                      <span>{route.from}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span>{route.to}</span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <Button 
              type="submit" 
              className="w-full py-6 text-lg bg-[#9b87d4] hover:bg-[#8a76c3]"
              disabled={!isFormValid}
            >
              Check Delay Prediction
            </Button>
          </form>
        </Tabs>
      </Card>
    </div>
  );
}
