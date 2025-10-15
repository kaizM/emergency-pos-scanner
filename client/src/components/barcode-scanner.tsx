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
  const [scanBlocked, setScanBlocked] = useState(false);
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

  // Convert UPC-E to UPC-A (for cigarettes and other short barcodes)
  const convertUPCEtoUPCA = (upce: string): string => {
    // Remove check digit if 8 digits, keep if 7 or 6
    let code = upce;
    if (code.length === 8) {
      code = code.substring(0, 7);
    }
    if (code.length === 7) {
      code = code.substring(1, 7); // Remove leading 0
    }
    if (code.length !== 6) return upce; // Not UPC-E

    const lastDigit = parseInt(code[5]);
    let upca = '';

    if (lastDigit <= 2) {
      // Pattern XXabc0 -> 0XX00000abc0
      upca = '0' + code[0] + code[1] + code[5] + '0000' + code[2] + code[3] + code[4];
    } else if (lastDigit === 3) {
      // Pattern XXXab3 -> 0XXX000ab3
      upca = '0' + code.substring(0, 3) + '000' + code[3] + code[4] + '3';
    } else if (lastDigit === 4) {
      // Pattern XXXXa4 -> 0XXXX0000a4
      upca = '0' + code.substring(0, 4) + '00000' + code[4];
    } else {
      // Pattern XXXXXd (5-9) -> 0XXXXX0000d
      upca = '0' + code.substring(0, 5) + '0000' + code[5];
    }

    // Calculate UPC-A check digit
    let oddSum = 0, evenSum = 0;
    for (let i = 0; i < 11; i++) {
      if (i % 2 === 0) oddSum += parseInt(upca[i]);
      else evenSum += parseInt(upca[i]);
    }
    const check = (10 - ((oddSum * 3 + evenSum) % 10)) % 10;
    return upca + check;
  };

  const handleDetected = (result: any) => {
    // GLOBAL BLOCK: Prevent ANY scan if blocked
    if (scanBlocked) {
      return;
    }

    const now = Date.now();
    let code = result.codeResult.code;

    // Convert UPC-E to UPC-A for cigarettes (Modisoft compatibility)
    if (code.length >= 6 && code.length <= 8) {
      const converted = convertUPCEtoUPCA(code);
      if (converted !== code) {
        console.log(`UPC-E ${code} converted to UPC-A ${converted}`);
        code = converted;
      }
    }

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
    if (lastResults.current.length > 15) {
      lastResults.current.shift();
    }

    // Count how many times this code appears in recent scans
    const confirmCount = lastResults.current.filter(c => c === code).length;
    
    // Require 3 confirmations for first scan of this barcode
    if (confirmCount < 3) {
      return;
    }

    // Clear confirmation buffer for next scan
    lastResults.current = [];
    setLastDetected(code);
    lastScanTime.current = now;

    // BLOCK ALL SCANS for 3 seconds
    setScanBlocked(true);
    setTimeout(() => {
      setScanBlocked(false);
    }, 3000);

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
    <div className="flex flex-col md:h-full">
      {/* Scanner Viewport */}
      <div
        className={`
          relative rounded-md overflow-hidden border-2 transition-all duration-200
          ${isScanning ? "border-ring" : "border-border"}
          ${scanSuccess ? "ring-4 ring-primary ring-opacity-50 scale-[1.02]" : ""}
          ${error ? "border-destructive" : ""}
          h-[100px] md:flex-1 md:h-auto md:min-h-[500px]
        `}
        data-testid="scanner-viewport"
      >
        {/* Camera Feed Container */}
        <div
          ref={scannerRef}
          className={`absolute inset-0 bg-black ${!isScanning ? "hidden" : ""}`}
        />

        {/* Scanner Active Overlay */}
        {isScanning && !scanBlocked && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner Guides */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-ring rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-ring rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-ring rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-ring rounded-br-lg" />

            {/* Center Scan Line */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1 bg-ring animate-pulse" />

            {/* Active Indicator */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-ring/90 text-white px-3 py-1 rounded-full text-xs font-bold">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              READY
            </div>
          </div>
        )}

        {/* Blocked Overlay */}
        {isScanning && scanBlocked && (
          <div className="absolute inset-0 pointer-events-none bg-amber-500/20">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-500/90 text-white px-4 py-2 rounded-lg text-center">
              <span className="text-sm font-bold">WAIT 3 SEC</span>
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
        className="mt-3 min-h-12 md:min-h-14 text-base font-semibold"
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
