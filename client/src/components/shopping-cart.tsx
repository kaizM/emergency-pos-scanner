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
      {/* Cart Header - PROFESSIONAL */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <CartIcon className="h-6 w-6 md:h-8 md:w-8" />
          Cart
          {items.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-base px-3 py-1">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </Badge>
          )}
        </h2>
        
        {items.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="h-12 text-base"
                data-testid="button-clear-cart"
              >
                <Trash2 className="h-5 w-5 mr-2" />
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

      {/* Cart Items - BIGGER with less scrolling */}
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center border-2 border-dashed border-border rounded-lg">
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
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
          {items.map((item, index) => (
            <Card
              key={item.id}
              className="p-4 md:p-6 hover-elevate shrink-0"
              data-testid={`cart-item-${index}`}
            >
              {/* Mobile Layout - PROFESSIONAL POS */}
              <div className="flex flex-col gap-3 md:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-2xl leading-tight mb-1" data-testid={`text-item-name-${index}`}>
                      {item.name}
                    </h3>
                    <p className="text-sm font-mono text-muted-foreground" data-testid={`text-item-barcode-${index}`}>
                      {item.barcode}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 text-destructive hover:text-destructive shrink-0"
                    onClick={() => onRemoveItem(item.id)}
                    data-testid={`button-remove-${index}`}
                  >
                    <X className="h-7 w-7" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      data-testid={`button-decrease-${index}`}
                    >
                      <Minus className="h-6 w-6" />
                    </Button>
                    <div className="min-w-[70px] text-center">
                      <span className="font-bold text-4xl" data-testid={`text-quantity-${index}`}>
                        {item.quantity}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      data-testid={`button-increase-${index}`}
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </div>
                  <span className="font-bold text-4xl font-mono text-primary" data-testid={`text-item-price-${index}`}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Desktop Layout - Row LARGER */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-2xl leading-tight mb-1.5" data-testid={`text-item-name-${index}`}>
                    {item.name}
                  </h3>
                  <p className="text-base font-mono text-muted-foreground" data-testid={`text-item-barcode-${index}`}>
                    {item.barcode}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    data-testid={`button-decrease-${index}`}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <div className="min-w-[70px] text-center">
                    <span className="font-bold text-3xl" data-testid={`text-quantity-${index}`}>
                      {item.quantity}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    data-testid={`button-increase-${index}`}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <span className="font-bold text-3xl font-mono text-primary min-w-[140px] text-right" data-testid={`text-item-price-${index}`}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 text-destructive hover:text-destructive"
                  onClick={() => onRemoveItem(item.id)}
                  data-testid={`button-remove-${index}`}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Totals Section - PROFESSIONAL */}
      {items.length > 0 && (
        <div className="mt-4 space-y-4 shrink-0">
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-mono font-bold" data-testid="text-subtotal">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground font-medium">
                  Tax ({(taxRate * 100).toFixed(2)}%)
                </span>
                <span className="font-mono font-bold" data-testid="text-tax">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">Total</span>
                <span className="text-4xl font-bold font-mono text-primary" data-testid="text-total">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <Button
            onClick={onCheckout}
            size="lg"
            className="w-full min-h-16 text-xl font-bold uppercase"
            data-testid="button-checkout"
          >
            Checkout
          </Button>
        </div>
      )}
    </div>
  );
}
