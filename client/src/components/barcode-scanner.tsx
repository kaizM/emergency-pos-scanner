import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);
  const [error, setError] = useState<string>("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanBlocked, setScanBlocked] = useState(false);
  const lastScanTime = useRef<number>(0);

  useEffect(() => {
    // Initialize reader with hints for better detection
    const hints = new Map();
    const formats = [
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);

    readerRef.current = new BrowserMultiFormatReader(hints);

    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (isScanning) {
      startScanner();
    } else {
      stopScanner();
    }
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
    
    if (!readerRef.current || !videoRef.current) return;

    try {
      // Get available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // Try to find rear camera (environment)
      const rearCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );

      const deviceId = rearCamera?.deviceId || videoDevices[videoDevices.length - 1]?.deviceId;

      // Start continuous scanning - store controls
      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            handleBarcodeDetected(result.getText());
          }
          // Ignore errors (normal when no barcode visible)
        }
      );
    } catch (err: any) {
      console.error("Scanner start error:", err);
      setError("Camera access denied. Please allow camera permissions.");
      onScanningChange(false);
    }
  };

  const stopScanner = () => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
        controlsRef.current = null;
      } catch (e) {
        // Already stopped, ignore
      }
    }
  };

  const handleBarcodeDetected = (code: string) => {
    // GLOBAL BLOCK: Prevent ANY scan if blocked
    if (scanBlocked) {
      return;
    }

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

    lastScanTime.current = Date.now();
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
          ${isScanning ? "border-primary" : "border-border"}
          ${scanSuccess ? "ring-4 ring-primary ring-opacity-50 scale-[1.02]" : ""}
          ${error ? "border-destructive" : ""}
          h-[100px] md:flex-1 md:h-auto md:min-h-[500px]
        `}
        data-testid="scanner-viewport"
      >
        {/* Video Feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Scanning Guide Box */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner guides */}
            <div className="absolute top-[25%] left-[10%] right-[10%] bottom-[25%] border-2 border-primary">
              {/* Top-left corner */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary" />
              {/* Top-right corner */}
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary" />
              {/* Bottom-left corner */}
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary" />
              {/* Bottom-right corner */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary" />
            </div>
          </div>
        )}

        {/* Scanner Active Indicator */}
        {isScanning && !scanBlocked && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold z-10">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            READY
          </div>
        )}

        {/* Blocked Overlay */}
        {isScanning && scanBlocked && (
          <div className="absolute inset-0 pointer-events-none bg-amber-500/30 z-20">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-500/95 text-white px-5 py-3 rounded-lg text-center">
              <span className="text-base font-bold">WAIT 5 SEC</span>
            </div>
          </div>
        )}

        {/* Idle State */}
        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
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
          <div className="absolute inset-0 bg-primary/20 pointer-events-none animate-pulse z-30" />
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
