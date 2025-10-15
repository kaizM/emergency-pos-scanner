import { useState, useEffect } from "react";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { ShoppingCart } from "@/components/shopping-cart";
import { PaymentFlow } from "@/components/payment-flow";
import { ManualEntryDialog } from "@/components/manual-entry-dialog";
import { PricebookUpload } from "@/components/pricebook-upload";
import { Header } from "@/components/header";
import { CartItem, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Upload, Settings, Download, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// GitHub raw URL for pricebook
const GITHUB_PRICEBOOK_URL = "https://raw.githubusercontent.com/kaizM/emergency-pos-scanner/main/server/pricebook.json";

export default function POSScanner() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>("");
  const [showUpload, setShowUpload] = useState(false);
  const [pricebook, setPricebook] = useState<Product[]>([]);
  const [loadingPricebook, setLoadingPricebook] = useState(true);
  const { toast } = useToast();

  const TAX_RATE = 0.0825;

  // Auto-load pricebook from GitHub on startup
  useEffect(() => {
    const loadPricebookFromGitHub = async () => {
      try {
        const response = await fetch(GITHUB_PRICEBOOK_URL);
        if (response.ok) {
          const data = await response.json();
          setPricebook(data);
          toast({
            title: "Pricebook Loaded",
            description: `${data.length.toLocaleString()} products ready from GitHub`,
            className: "bg-primary text-primary-foreground",
          });
        } else {
          throw new Error("Failed to fetch pricebook");
        }
      } catch (error) {
        console.error("Error loading pricebook from GitHub:", error);
        toast({
          title: "Pricebook Not Available",
          description: "Upload Excel file to use scanner",
          variant: "destructive",
        });
      } finally {
        setLoadingPricebook(false);
      }
    };

    loadPricebookFromGitHub();
  }, []);

  const handleBarcodeDetected = async (barcode: string) => {
    setLastScannedBarcode(barcode);
    
    // Look up product in local pricebook
    const product = pricebook.find(p => p.barcode === barcode);
    
    if (!product) {
      toast({
        title: "Item Not Found",
        description: `Barcode ${barcode} not in pricebook. Enter price manually.`,
        variant: "destructive",
      });
      setShowManualEntry(true);
      return;
    }

    addToCart(product);
  };

  const addToCart = (product: Product | { barcode: string; name: string; price: number }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.barcode === product.barcode);
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      const newItem: CartItem = {
        id: `${product.barcode}-${Date.now()}`,
        barcode: product.barcode,
        name: product.name,
        price: product.price,
        quantity: 1,
      };
      
      return [...prevCart, newItem];
    });

    toast({
      title: "✓ Item Added",
      description: `${product.name} - $${product.price.toFixed(2)}`,
      className: "bg-primary text-primary-foreground text-lg",
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setShowPayment(false);
    setIsScanning(false);
    toast({
      title: "Cart Cleared",
      description: "Ready for next customer",
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Scan items before checking out",
        variant: "destructive",
      });
      return;
    }
    setShowPayment(true);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-6 max-w-7xl mx-auto">
          {/* Scanner Section - Left Side */}
          <div className="flex flex-col md:flex-1 md:min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl md:text-2xl font-semibold">Scanner</h2>
              <div className="flex gap-2">
                <Dialog open={showUpload} onOpenChange={setShowUpload}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      data-testid="button-upload-pricebook"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Pricebook</DialogTitle>
                    </DialogHeader>
                    <PricebookUpload 
                      onUploadComplete={(products) => {
                        setPricebook(products);
                        setShowUpload(false);
                      }} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <BarcodeScanner
              isScanning={isScanning}
              onScanningChange={setIsScanning}
              onBarcodeDetected={handleBarcodeDetected}
            />
            
            {/* BIG Manual Entry Button */}
            <Button
              onClick={() => setShowManualEntry(true)}
              variant="outline"
              size="lg"
              className="mt-3 min-h-16 text-xl font-bold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              data-testid="button-manual-entry"
            >
              <DollarSign className="mr-3 h-7 w-7" />
              Manual Entry (Kitchen)
            </Button>
          </div>

          {/* Cart Section - Right Side */}
          <div className="flex-1 flex flex-col min-h-0 md:flex-1">
            <ShoppingCart
              items={cart}
              subtotal={subtotal}
              tax={tax}
              total={total}
              taxRate={TAX_RATE}
              onRemoveItem={removeFromCart}
              onUpdateQuantity={updateQuantity}
              onClearCart={clearCart}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </main>

      {/* Payment Flow Modal */}
      {showPayment && (
        <PaymentFlow
          total={total}
          subtotal={subtotal}
          tax={tax}
          items={cart}
          onClose={() => setShowPayment(false)}
          onComplete={clearCart}
        />
      )}

      {/* Manual Entry Dialog */}
      <ManualEntryDialog
        open={showManualEntry}
        onOpenChange={setShowManualEntry}
        defaultBarcode={lastScannedBarcode}
        onAddItem={(item) => {
          addToCart(item);
          setShowManualEntry(false);
        }}
      />
    </div>
  );
}
