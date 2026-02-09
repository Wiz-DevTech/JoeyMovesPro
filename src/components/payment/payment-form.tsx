"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentFormProps {
  jobId: string;
  amount: number;
  type: "deposit" | "final";
  onSuccess?: () => void;
}

export function PaymentForm({ jobId, amount, type, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings/${jobId}/payment-success`,
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
      } else {
        toast.success("Payment successful!");
        onSuccess?.();
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {type === "deposit" ? "Deposit Amount" : "Final Payment"}
        </div>
        <div className="text-2xl font-bold">
          ${amount.toFixed(2)}
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}