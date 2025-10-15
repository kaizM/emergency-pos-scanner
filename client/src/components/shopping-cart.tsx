import { CartItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/react-scroll-area";
import { ShoppingCart as CartIcon, Trash2, X, Minus, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ShoppingCartProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function ShoppingCart({
  items,
  subtotal,
  tax,
  total,
  taxRate,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onCheckout,
}: ShoppingCartProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <CartIcon className="h-6 w-6" />
          Cart
          {items.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </Badge>
          )}
        </h2>
        
        {items.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-clear-cart"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Cart?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all items from the cart. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onClearCart}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-testid="button-confirm-clear"
                >
                  Yes, Clear Cart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Cart Items */}
      <Card className="flex-1 flex flex-col min-h-0 p-4">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-3">
              <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <CartIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">
                Scan items to begin
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-4 px-4">
            <div className="space-y-2">
              {items.map((item, index) => (
                <Card
                  key={item.id}
                  className="p-3 hover-elevate"
                  data-testid={`cart-item-${index}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base leading-tight mb-1" data-testid={`text-item-name-${index}`}>
                        {item.name}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground" data-testid={`text-item-barcode-${index}`}>
                        {item.barcode}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        data-testid={`button-decrease-${index}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-10 text-center">
                        <span className="font-semibold" data-testid={`text-quantity-${index}`}>
                          {item.quantity}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        data-testid={`button-increase-${index}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg font-mono" data-testid={`text-item-price-${index}`}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemoveItem(item.id)}
                        data-testid={`button-remove-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Totals Section */}
      {items.length > 0 && (
        <div className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-medium" data-testid="text-subtotal">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">
                  Tax ({(taxRate * 100).toFixed(2)}%)
                </span>
                <span className="font-mono font-medium" data-testid="text-tax">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-3xl font-bold font-mono text-primary" data-testid="text-total">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <Button
            onClick={onCheckout}
            size="lg"
            className="w-full min-h-14 text-lg font-bold uppercase"
            data-testid="button-checkout"
          >
            Checkout
          </Button>
        </div>
      )}
    </div>
  );
}
