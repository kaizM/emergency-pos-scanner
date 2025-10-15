import { useEffect, useRef, useState } from "react";
import Quagga from "@ericblade/quagga2";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Scan } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BarcodeScannerProps {
  isScanning: boolean;
  onScanningChange: (scanning: boolean) => void;
  onBarcodeDetected: (barcode: string) => void;
}

export function BarcodeScanner({
  isScanning,
  onScanningChange,
  onBarcodeDetected,
}: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");
  const [lastDetected, setLastDetected] = useState<string>("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const lastScanTime = useRef<number>(0);
  const lastResults = useRef<string[]>([]);

  useEffect(() => {
    if (isScanning && scannerRef.current) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  const startScanner = async () => {
    setError("");
    
    try {
      await Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: scannerRef.current!,
            constraints: {
              width: { min: 1280, ideal: 1920, max: 1920 },
              height: { min: 720, ideal: 1080, max: 1080 },
              facingMode: "environment",
              aspectRatio: { min: 1, max: 2 },
            },
            area: {
              top: "25%",
              right: "25%",
              left: "25%",
              bottom: "25%",
            },
            singleChannel: false,
          },
          decoder: {
            readers: [
              "upc_reader",
              "upc_e_reader",
              "ean_reader",
              "ean_8_reader",
              "code_128_reader",
            ],
            multiple: false,
          },
          locate: true,
          locator: {
            patchSize: "x-small",
            halfSample: false,
          },
          numOfWorkers: Math.min(navigator.hardwareConcurrency || 4, 8),
          frequency: 10,
        },
        (err) => {
          if (err) {
            console.error("Scanner init error:", err);
            setError("Camera unavailable. Please check permissions and try again.");
            onScanningChange(false);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected(handleDetected);
    } catch (err) {
      console.error("Scanner error:", err);
      setError("Camera error. Please refresh and allow camera access.");
      onScanningChange(false);
    }
  };

  const stopScanner = () => {
    Quagga.stop();
    Quagga.offDetected(handleDetected);
  };

  const handleDetected = (result: any) => {
    const now = Date.now();
    const code = result.codeResult.code;

    // Professional accuracy: Calculate error rate
    let avgError = 0;
    if (result.codeResult.decodedCodes && result.codeResult.decodedCodes.length > 0) {
      avgError = result.codeResult.decodedCodes.reduce((sum: number, code: any) => 
        sum + (code.error || 0), 0) / result.codeResult.decodedCodes.length;
      
      // Skip if error rate too high (professional threshold)
      if (avgError > 0.1) {
        return;
      }
    }

    // Multi-read validation: Require 3 identical reads for confirmation
    lastResults.current.push(code);
    if (lastResults.current.length > 20) {
      lastResults.current.shift();
    }

    // Count how many times this code appears in recent scans
    const confirmCount = lastResults.current.filter(c => c === code).length;
    
    // Require 3 confirmations for first scan of this barcode
    if (confirmCount < 3) {
      return;
    }

    // Debounce: prevent rapid duplicate scans
    if (code === lastDetected && now - lastScanTime.current < 2000) {
      return;
    }

    // Clear confirmation buffer for next scan
    lastResults.current = [];
    setLastDetected(code);
    lastScanTime.current = now;

    // Visual and audio feedback
    setScanSuccess(true);
    setTimeout(() => setScanSuccess(false), 300);

    // Beep sound for successful scan
    try {
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio not available, ignore
    }

    onBarcodeDetected(code);
  };

  const toggleScanning = () => {
    onScanningChange(!isScanning);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scanner Viewport */}
      <div
        className={`
          relative flex-1 rounded-md overflow-hidden border-2 transition-all duration-200
          ${isScanning ? "border-ring" : "border-border"}
          ${scanSuccess ? "ring-4 ring-primary ring-opacity-50 scale-[1.02]" : ""}
          ${error ? "border-destructive" : ""}
          min-h-[400px] md:min-h-[500px]
        `}
        data-testid="scanner-viewport"
      >
        {/* Camera Feed Container */}
        <div
          ref={scannerRef}
          className={`absolute inset-0 bg-black ${!isScanning ? "hidden" : ""}`}
        />

        {/* Scanner Active Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner Guides */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-ring rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-ring rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-ring rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-ring rounded-br-lg" />

            {/* Center Scan Line */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1 bg-ring animate-pulse" />

            {/* Active Indicator */}
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-ring/90 text-white px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-medium">SCANNING</span>
            </div>
          </div>
        )}

        {/* Idle State */}
        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Scan className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">
                Tap to Start Scanning
              </p>
            </div>
          </div>
        )}

        {/* Success Flash */}
        {scanSuccess && (
          <div className="absolute inset-0 bg-primary/20 pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Scanner Control Button */}
      <Button
        onClick={toggleScanning}
        variant={isScanning ? "destructive" : "default"}
        size="lg"
        className="mt-4 min-h-14 text-base font-semibold"
        data-testid={isScanning ? "button-stop-scan" : "button-start-scan"}
      >
        {isScanning ? (
          <>
            <CameraOff className="mr-2 h-5 w-5" />
            Stop Scanning
          </>
        ) : (
          <>
            <Camera className="mr-2 h-5 w-5" />
            Start Scanning
          </>
        )}
      </Button>
    </div>
  );
}
