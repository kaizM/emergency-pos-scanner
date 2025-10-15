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
      {/* Cart Header - COMPACT */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg md:text-2xl font-semibold flex items-center gap-1.5">
          <CartIcon className="h-4 w-4 md:h-6 md:w-6" />
          Cart
          {items.length > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
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
                className="h-8 text-xs md:h-9 md:text-sm"
                data-testid="button-clear-cart"
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1.5" />
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
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {items.map((item, index) => (
            <Card
              key={item.id}
              className="p-3 md:p-6 hover-elevate shrink-0"
              data-testid={`cart-item-${index}`}
            >
              {/* Mobile Layout - COMPACT */}
              <div className="flex items-center justify-between gap-2 md:hidden">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl leading-tight mb-0.5 truncate" data-testid={`text-item-name-${index}`}>
                    {item.name}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground" data-testid={`text-item-barcode-${index}`}>
                    {item.barcode}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      data-testid={`button-decrease-${index}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="min-w-[40px] text-center">
                      <span className="font-bold text-2xl" data-testid={`text-quantity-${index}`}>
                        {item.quantity}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      data-testid={`button-increase-${index}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="font-bold text-2xl font-mono text-primary min-w-[90px] text-right" data-testid={`text-item-price-${index}`}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => onRemoveItem(item.id)}
                    data-testid={`button-remove-${index}`}
                  >
                    <X className="h-5 w-5" />
                  </Button>
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

      {/* Totals Section - COMPACT */}
      {items.length > 0 && (
        <div className="mt-2 space-y-2 shrink-0">
          <Card className="p-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-medium" data-testid="text-subtotal">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Tax ({(taxRate * 100).toFixed(2)}%)
                </span>
                <span className="font-mono font-medium" data-testid="text-tax">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-border my-0.5" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-xl font-bold font-mono text-primary" data-testid="text-total">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <Button
            onClick={onCheckout}
            className="w-full min-h-11 text-base font-bold uppercase"
            data-testid="button-checkout"
          >
            Checkout
          </Button>
        </div>
      )}
    </div>
  );
}
