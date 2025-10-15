import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanBlocked, setScanBlocked] = useState(false);
  const lastScanTime = useRef<number>(0);

  useEffect(() => {
    // Initialize scanner instance
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("barcode-scanner-region");
    }

    if (isScanning) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  // Convert UPC-E to UPC-A (for cigarettes and other short barcodes)
  const convertUPCEtoUPCA = (upce: string): string => {
    let code = upce;
    if (code.length === 8) {
      code = code.substring(0, 7);
    }
    if (code.length === 7) {
      code = code.substring(1, 7);
    }
    if (code.length !== 6) return upce;

    const lastDigit = parseInt(code[5]);
    let upca = '';

    if (lastDigit <= 2) {
      upca = '0' + code[0] + code[1] + code[5] + '0000' + code[2] + code[3] + code[4];
    } else if (lastDigit === 3) {
      upca = '0' + code.substring(0, 3) + '000' + code[3] + code[4] + '3';
    } else if (lastDigit === 4) {
      upca = '0' + code.substring(0, 4) + '00000' + code[4];
    } else {
      upca = '0' + code.substring(0, 5) + '0000' + code[5];
    }

    let oddSum = 0, evenSum = 0;
    for (let i = 0; i < 11; i++) {
      if (i % 2 === 0) oddSum += parseInt(upca[i]);
      else evenSum += parseInt(upca[i]);
    }
    const check = (10 - ((oddSum * 3 + evenSum) % 10)) % 10;
    return upca + check;
  };

  const startScanner = async () => {
    setError("");
    
    if (!scannerRef.current) return;

    try {
      // High-quality configuration for accurate scanning
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778,
        disableFlip: false,
        // Support all major barcode formats
        formatsToSupport: [
          0,  // QR_CODE
          8,  // UPC_A
          9,  // UPC_E
          13, // EAN_13
          14, // EAN_8
          3,  // CODE_128
          2,  // CODE_39
          15, // CODE_93
          16, // CODABAR
          17, // ITF
        ],
        // Better detection
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText: string) => {
          handleBarcodeDetected(decodedText);
        },
        (errorMessage: string) => {
          // Ignore scanning errors - they're normal when no barcode is visible
        }
      );
    } catch (err: any) {
      console.error("Scanner start error:", err);
      setError("Camera access denied. Please allow camera permissions and refresh.");
      onScanningChange(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Scanner stop error:", err);
      }
    }
  };

  const handleBarcodeDetected = (code: string) => {
    // GLOBAL BLOCK: Prevent ANY scan if blocked
    if (scanBlocked) {
      return;
    }

    const now = Date.now();

    // Convert UPC-E to UPC-A for cigarettes (Modisoft compatibility)
    if (code.length >= 6 && code.length <= 8) {
      const converted = convertUPCEtoUPCA(code);
      if (converted !== code) {
        console.log(`UPC-E ${code} converted to UPC-A ${converted}`);
        code = converted;
      }
    }

    // BLOCK ALL SCANS for 5 seconds
    setScanBlocked(true);
    setTimeout(() => {
      setScanBlocked(false);
    }, 5000);

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

    lastScanTime.current = now;
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
          id="barcode-scanner-region"
          className="absolute inset-0 bg-black"
        />

        {/* Scanner Active Overlay */}
        {isScanning && !scanBlocked && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Active Indicator */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-ring/90 text-white px-3 py-1 rounded-full text-xs font-bold">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              READY
            </div>
          </div>
        )}

        {/* Blocked Overlay */}
        {isScanning && scanBlocked && (
          <div className="absolute inset-0 pointer-events-none bg-amber-500/30 z-10">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-500/95 text-white px-5 py-3 rounded-lg text-center">
              <span className="text-base font-bold">WAIT 5 SEC</span>
            </div>
          </div>
        )}

        {/* Idle State */}
        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
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
          <div className="absolute inset-0 bg-primary/20 pointer-events-none animate-pulse z-10" />
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
