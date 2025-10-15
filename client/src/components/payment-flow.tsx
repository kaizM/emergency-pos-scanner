import { useState } from "react";
import { CartItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DollarSign, CreditCard, ArrowLeft, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentFlowProps {
  total: number;
  subtotal: number;
  tax: number;
  items: CartItem[];
  onClose: () => void;
  onComplete: () => void;
}

type PaymentStep = "select" | "cash" | "card" | "complete";

export function PaymentFlow({
  total,
  subtotal,
  tax,
  items,
  onClose,
  onComplete,
}: PaymentFlowProps) {
  const [step, setStep] = useState<PaymentStep>("select");
  const [cashAmount, setCashAmount] = useState("");
  const change = parseFloat(cashAmount) - total;

  const handleCashPayment = () => {
    if (parseFloat(cashAmount) >= total) {
      setStep("complete");
      setTimeout(() => {
        onComplete();
        onClose();
      }, 2000);
    }
  };

  const handleCardPayment = () => {
    setStep("complete");
    setTimeout(() => {
      onComplete();
      onClose();
    }, 2000);
  };

  const addToAmount = (value: number) => {
    const current = parseFloat(cashAmount) || 0;
    setCashAmount((current + value).toFixed(2));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === "select" && "Payment Method"}
            {step === "cash" && "Cash Payment"}
            {step === "card" && "Card Payment"}
            {step === "complete" && "Payment Complete"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total Display */}
          <Card className="p-4 bg-primary/5">
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Amount Due</p>
              <p className="text-5xl font-bold font-mono text-primary" data-testid="text-payment-total">
                ${total.toFixed(2)}
              </p>
            </div>
          </Card>

          {/* Payment Method Selection */}
          {step === "select" && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex-col gap-3 text-lg"
                onClick={() => setStep("cash")}
                data-testid="button-pay-cash"
              >
                <DollarSign className="h-12 w-12" />
                Cash
              </Button>
              <Button
                variant="outline"
                className="h-32 flex-col gap-3 text-lg"
                onClick={() => setStep("card")}
                data-testid="button-pay-card"
              >
                <CreditCard className="h-12 w-12" />
                Card
              </Button>
            </div>
          )}

          {/* Cash Payment */}
          {step === "cash" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Amount Tendered
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="text-2xl font-mono h-14 text-center"
                  placeholder="0.00"
                  data-testid="input-cash-amount"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => addToAmount(amount)}
                    data-testid={`button-add-${amount}`}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>

              {/* Change Display */}
              {cashAmount && parseFloat(cashAmount) >= total && (
                <Card className="p-4 bg-primary/10">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Change</p>
                    <p className="text-3xl font-bold font-mono text-primary" data-testid="text-change">
                      ${change.toFixed(2)}
                    </p>
                  </div>
                </Card>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="flex-1"
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleCashPayment}
                  disabled={!cashAmount || parseFloat(cashAmount) < total}
                  className="flex-1"
                  data-testid="button-complete-cash"
                >
                  Complete Payment
                </Button>
              </div>
            </div>
          )}

          {/* Card Payment */}
          {step === "card" && (
            <div className="space-y-6">
              <Card className="p-6 bg-muted/50">
                <div className="space-y-4 text-center">
                  <div className="mx-auto w-20 h-20 rounded-full bg-ring/20 flex items-center justify-center">
                    <CreditCard className="h-10 w-10 text-ring" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Use Card Reader</h3>
                    <p className="text-muted-foreground">
                      Insert, tap, or swipe card on your external card reader
                    </p>
                  </div>
                </div>
              </Card>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ring" />
                  Wait for customer to complete payment
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ring" />
                  Confirm payment on card reader
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ring" />
                  Click button below once confirmed
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="flex-1"
                  data-testid="button-back-card"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleCardPayment}
                  className="flex-1"
                  data-testid="button-complete-card"
                >
                  Payment Confirmed
                </Button>
              </div>
            </div>
          )}

          {/* Payment Complete */}
          {step === "complete" && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary">Payment Complete!</h3>
                <p className="text-muted-foreground mt-2">
                  Transaction successful. Cart will be cleared.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
