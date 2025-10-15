import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ManualEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultBarcode?: string;
  onAddItem: (item: { barcode: string; name: string; price: number }) => void;
}

export function ManualEntryDialog({
  open,
  onOpenChange,
  defaultBarcode = "",
  onAddItem,
}: ManualEntryDialogProps) {
  const [name, setName] = useState("");
  const [priceInCents, setPriceInCents] = useState(""); // Store as cents (799 = $7.99)
  const [barcode, setBarcode] = useState(defaultBarcode);
  const [error, setError] = useState("");

  // Format cents to dollars display (799 → $7.99)
  const formatPrice = (cents: string): string => {
    if (!cents) return "$0.00";
    
    const num = parseInt(cents) || 0;
    const dollars = Math.floor(num / 100);
    const centsRemainder = num % 100;
    return `$${dollars}.${centsRemainder.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const priceValue = parseInt(priceInCents) / 100; // Convert cents to dollars
    if (!priceInCents || priceValue <= 0) {
      setError("Enter a price");
      return;
    }

    onAddItem({
      barcode: barcode || `MANUAL-${Date.now()}`,
      name: name.trim() || "Kitchen Item",
      price: priceValue,
    });

    // Reset form
    setName("");
    setPriceInCents("");
    setBarcode("");
    onOpenChange(false);
  };

  const addToPrice = (digit: string) => {
    // Limit to reasonable price (max 999999 cents = $9,999.99)
    if (priceInCents.length >= 6) return;
    setPriceInCents(priceInCents + digit);
  };

  const clearPrice = () => {
    setPriceInCents("");
  };

  const backspacePrice = () => {
    setPriceInCents(priceInCents.slice(0, -1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Manual Entry</DialogTitle>
          <DialogDescription className="text-base">
            Type price in cents. Example: 799 = $7.99, 1199 = $11.99
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {defaultBarcode && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Barcode <span className="font-mono font-semibold">{defaultBarcode}</span> not found
              </AlertDescription>
            </Alert>
          )}

          {/* Price Display */}
          <div className="space-y-2">
            <Label htmlFor="item-price" className="text-xl font-bold">Price</Label>
            <div className="relative">
              <div className="text-5xl font-mono text-center font-bold text-primary h-24 flex items-center justify-center border-2 border-ring rounded-md bg-muted/30">
                {formatPrice(priceInCents)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Enter: {priceInCents || "0"} cents
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-base text-muted-foreground">Item Name (Optional)</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Leave empty for "Kitchen Item"'
              data-testid="input-manual-name"
              className="h-12"
            />
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <Button
                key={num}
                type="button"
                variant="outline"
                className="h-14 text-2xl font-semibold"
                onClick={() => addToPrice(num)}
                data-testid={`button-num-${num}`}
              >
                {num}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              className="h-14 text-xl font-semibold"
              onClick={clearPrice}
              data-testid="button-clear-price"
            >
              CLEAR
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-14 text-2xl font-semibold"
              onClick={() => addToPrice("0")}
              data-testid="button-num-0"
            >
              0
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-14 text-xl font-semibold"
              onClick={backspacePrice}
              data-testid="button-backspace-price"
            >
              ←
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 min-h-12"
              data-testid="button-cancel-manual"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 min-h-12 text-lg font-bold"
              data-testid="button-add-manual"
            >
              Add to Cart
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
