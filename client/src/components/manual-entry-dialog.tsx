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
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState(defaultBarcode);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const priceValue = parseFloat(price);
    if (!price || isNaN(priceValue) || priceValue <= 0) {
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
    setPrice("");
    setBarcode("");
    onOpenChange(false);
  };

  const addToPrice = (value: string) => {
    if (price === "0" || !price) {
      setPrice(value);
    } else {
      setPrice(price + value);
    }
  };

  const clearPrice = () => {
    setPrice("");
  };

  const backspacePrice = () => {
    setPrice(price.slice(0, -1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Manual Entry</DialogTitle>
          <DialogDescription className="text-base">
            For kitchen items or products without UPC. Just enter price.
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

          <div className="space-y-2">
            <Label htmlFor="item-price" className="text-xl font-bold">Price (Required)</Label>
            <Input
              id="item-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="text-4xl font-mono h-20 text-center font-bold"
              type="number"
              step="0.01"
              min="0"
              data-testid="input-manual-price"
              autoFocus
            />
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
                className="h-12 text-lg font-semibold"
                onClick={() => addToPrice(num)}
                data-testid={`button-num-${num}`}
              >
                {num}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              className="h-12 text-lg font-semibold"
              onClick={clearPrice}
              data-testid="button-clear-price"
            >
              C
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 text-lg font-semibold"
              onClick={() => addToPrice("0")}
              data-testid="button-num-0"
            >
              0
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 text-lg font-semibold"
              onClick={() => addToPrice(".")}
              data-testid="button-decimal"
            >
              .
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
              className="flex-1"
              data-testid="button-cancel-manual"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
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
