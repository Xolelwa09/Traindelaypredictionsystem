import { Cloud, MapPin, Database, Brain } from "lucide-react";
import { Card } from "./ui/card";
import { useEffect, useState } from "react";

export function ProcessingScreen() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { icon: MapPin, label: "Fetching GPS data", color: "text-green-600" },
    { icon: Cloud, label: "Analyzing weather conditions", color: "text-blue-600" },
    { icon: Database, label: "Loading historical data", color: "text-purple-600" },
    { icon: Brain, label: "Running AI prediction model", color: "text-orange-600" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 600);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full animate-pulse" />
            </div>
          </div>
          <h2 className="mb-2 text-blue-900">Analyzing Data...</h2>
          <p className="text-gray-600">Please wait while we process your request</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isPast = index < activeStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                  isActive ? "bg-blue-50 scale-105" : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isActive ? `bg-white shadow-lg` : "bg-white"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${isActive ? step.color : "text-gray-400"} ${
                      isActive ? "animate-bounce" : ""
                    }`}
                  />
                </div>
                <span
                  className={`${
                    isActive ? "text-gray-900" : "text-gray-500"
                  } transition-colors`}
                >
                  {step.label}
                </span>
                {isPast && (
                  <svg
                    className="w-5 h-5 text-green-500 ml-auto"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
