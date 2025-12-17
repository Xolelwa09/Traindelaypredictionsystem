import { useState } from "react";
import { Bell, BellOff, Clock, AlertCircle, CheckCircle, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner@2.0.3";

interface NotificationPanelProps {
  trainNumber: string;
  delayMinutes: number;
  eta: string;
}

interface NotificationSettings {
  delayAlerts: boolean;
  arrivalReminders: boolean;
  platformChanges: boolean;
  minutesBefore: number;
}

export function NotificationPanel({ trainNumber, delayMinutes, eta }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    delayAlerts: true,
    arrivalReminders: true,
    platformChanges: true,
    minutesBefore: 10,
  });

  const handleEnableNotifications = () => {
    setIsEnabled(true);
    setIsOpen(true);
    
    // Simulate browser notification permission
    toast.success(
      <div className="flex items-start gap-2">
        <Bell className="w-5 h-5 text-green-600 mt-0.5" />
        <div>
          <p className="font-medium">Notifications Enabled</p>
          <p className="text-sm text-gray-600">You'll receive alerts for {trainNumber}</p>
        </div>
      </div>,
      { duration: 3000 }
    );

    // Simulate delay alert if there's a delay
    if (delayMinutes > 5) {
      setTimeout(() => {
        toast.warning(
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium">Delay Alert - {trainNumber}</p>
              <p className="text-sm text-gray-600">Expected delay: {delayMinutes} minutes</p>
            </div>
          </div>,
          { duration: 5000 }
        );
      }, 2000);
    }
  };

  const handleDisableNotifications = () => {
    setIsEnabled(false);
    toast.info("Notifications disabled for " + trainNumber);
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    toast.success("Notification settings updated");
  };

  return (
    <>
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#9b87d4] rounded-full flex items-center justify-center">
              {isEnabled ? (
                <Bell className="w-5 h-5 text-white" />
              ) : (
                <BellOff className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-gray-900">
                {isEnabled ? "Notifications Active" : "Get Delay Alerts"}
              </p>
              <p className="text-sm text-gray-600">
                {isEnabled
                  ? "You'll be notified of any changes"
                  : "Enable push notifications for this train"}
              </p>
            </div>
          </div>
          {!isEnabled ? (
            <Button
              onClick={handleEnableNotifications}
              className="bg-[#9b87d4] hover:bg-[#8a76c3]"
            >
              Enable
            </Button>
          ) : (
            <Button
              onClick={() => setIsOpen(true)}
              variant="outline"
            >
              Settings
            </Button>
          )}
        </div>
      </Card>

      {/* Notification Settings Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Manage alerts for {trainNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Status */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-900">Notifications are active</span>
              </div>
            </div>

            {/* Notification Types */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-gray-900">Delay Alerts</p>
                    <p className="text-sm text-gray-600">
                      Get notified of any delays
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.delayAlerts}
                  onCheckedChange={(checked) => updateSetting("delayAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-gray-900">Arrival Reminders</p>
                    <p className="text-sm text-gray-600">
                      Remind me before arrival
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.arrivalReminders}
                  onCheckedChange={(checked) =>
                    updateSetting("arrivalReminders", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-gray-900">Platform Changes</p>
                    <p className="text-sm text-gray-600">
                      Alert on platform updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.platformChanges}
                  onCheckedChange={(checked) =>
                    updateSetting("platformChanges", checked)
                  }
                />
              </div>
            </div>

            {/* Reminder Timing */}
            {settings.arrivalReminders && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">
                  Remind me before arrival
                </p>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => updateSetting("minutesBefore", minutes)}
                      className={`flex-1 py-2 px-3 rounded-md transition-colors ${
                        settings.minutesBefore === minutes
                          ? "bg-[#9b87d4] text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleDisableNotifications}
                variant="outline"
                className="flex-1 gap-2"
              >
                <BellOff className="w-4 h-4" />
                Disable
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-[#9b87d4] hover:bg-[#8a76c3]"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
