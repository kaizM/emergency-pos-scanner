import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="border-b bg-card">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Emergency POS</h1>
            <p className="text-xs text-muted-foreground">Fast Checkout Scanner</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Network Status */}
          <div
            className="flex items-center gap-1.5"
            data-testid={isOnline ? "status-online" : "status-offline"}
          >
            {isOnline ? (
              <Wifi className="h-4 w-4 text-primary" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <span className="text-xs font-medium hidden sm:inline">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
