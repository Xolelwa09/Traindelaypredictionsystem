import { useState } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ProcessingScreen } from "./components/ProcessingScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { BusStopsScreen } from "./components/BusStopsScreen";
import { predictTrainDelay, predictTrainDelayByRoute } from "./utils/trainPredictionService";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

type Screen = "welcome" | "processing" | "results" | "busStops";

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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [trainNumber, setTrainNumber] = useState("");
  const [originStation, setOriginStation] = useState("");
  const [destinationStation, setDestinationStation] = useState("");
  const [prediction, setPrediction] = useState<DelayPrediction | null>(null);

  const handleSubmit = async (searchType: "train" | "route") => {
    if (searchType === "train" && !trainNumber.trim()) {
      toast.error("Please enter a train number");
      return;
    }

    if (searchType === "route" && (!originStation.trim() || !destinationStation.trim())) {
      toast.error("Please enter both origin and destination stations");
      return;
    }

    setCurrentScreen("processing");

    try {
      let result: DelayPrediction;
      
      if (searchType === "train") {
        // Pass destination for train number search if available
        result = await predictTrainDelay(trainNumber, destinationStation);
      } else {
        result = await predictTrainDelayByRoute(originStation, destinationStation);
      }
      
      setPrediction(result);
      setCurrentScreen("results");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch prediction");
      setCurrentScreen("welcome");
    }
  };

  const handleReset = () => {
    setCurrentScreen("welcome");
    setTrainNumber("");
    setOriginStation("");
    setDestinationStation("");
    setPrediction(null);
  };

  const handleNavigateToBusStops = () => {
    setCurrentScreen("busStops");
  };

  const handleBackToResults = () => {
    setCurrentScreen("results");
  };

  return (
    <>
      {currentScreen === "welcome" && (
        <WelcomeScreen
          trainNumber={trainNumber}
          onTrainNumberChange={setTrainNumber}
          originStation={originStation}
          onOriginChange={setOriginStation}
          destinationStation={destinationStation}
          onDestinationChange={setDestinationStation}
          onSubmit={handleSubmit}
        />
      )}

      {currentScreen === "processing" && <ProcessingScreen />}

      {currentScreen === "results" && prediction && (
        <ResultsScreen 
          prediction={prediction} 
          onReset={handleReset}
          onNavigateToBusStops={handleNavigateToBusStops}
        />
      )}

      {currentScreen === "busStops" && prediction && (
        <BusStopsScreen
          trainNumber={prediction.trainNumber}
          onBack={handleBackToResults}
        />
      )}

      <Toaster position="top-center" />
    </>
  );
}
