import { useState } from "react";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { ShoppingCart } from "@/components/shopping-cart";
import { PaymentFlow } from "@/components/payment-flow";
import { ManualEntryDialog } from "@/components/manual-entry-dialog";
import { PricebookUpload } from "@/components/pricebook-upload";
import { Header } from "@/components/header";
import { CartItem, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Upload, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function POSScanner() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>("");
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();

  const TAX_RATE = 0.0825;

  const handleBarcodeDetected = async (barcode: string) => {
    setLastScannedBarcode(barcode);
    
    try {
      const response = await fetch(`/api/pricebook/lookup/${barcode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Item Not Found",
            description: `Barcode ${barcode} not in pricebook. Enter price manually.`,
            variant: "destructive",
          });
          setShowManualEntry(true);
          return;
        }
        throw new Error("Failed to lookup product");
      }

      const product: Product = await response.json();
      addToCart(product);
      
    } catch (error) {
      console.error("Error looking up barcode:", error);
      toast({
        title: "Lookup Failed",
        description: "Could not connect to pricebook. Try manual entry.",
        variant: "destructive",
      });
      setShowManualEntry(true);
    }
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
      title: "Item Added",
      description: `${product.name} - $${product.price.toFixed(2)}`,
      className: "bg-primary text-primary-foreground",
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
        <div className="h-full flex flex-col md:flex-row gap-4 p-4 md:p-6 max-w-7xl mx-auto">
          {/* Scanner Section - Left Side */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Scanner</h2>
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
                    <PricebookUpload onUploadComplete={() => setShowUpload(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <BarcodeScanner
              isScanning={isScanning}
              onScanningChange={setIsScanning}
              onBarcodeDetected={handleBarcodeDetected}
            />
          </div>

          {/* Cart Section - Right Side */}
          <div className="flex-1 flex flex-col min-h-0">
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
