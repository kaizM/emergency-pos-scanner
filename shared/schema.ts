import { z } from "zod";

// Pricebook Product Schema
export const productSchema = z.object({
  barcode: z.string().min(1, "Barcode is required"),
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be positive"),
  category: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;

// Cart Item Schema
export const cartItemSchema = z.object({
  id: z.string(),
  barcode: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Manual Price Entry Schema
export const manualPriceEntrySchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.number().positive("Price must be positive"),
  barcode: z.string().optional(),
});

export type ManualPriceEntry = z.infer<typeof manualPriceEntrySchema>;

// Transaction Summary Schema
export const transactionSchema = z.object({
  items: z.array(cartItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  taxRate: z.number().default(0.0825), // 8.25%
  timestamp: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

// Cash Payment Schema
export const cashPaymentSchema = z.object({
  amountTendered: z.number().positive("Amount must be positive"),
  total: z.number(),
});

export type CashPayment = z.infer<typeof cashPaymentSchema>;

// Pricebook Upload Response
export type PricebookUploadResponse = {
  success: boolean;
  itemCount: number;
  message: string;
};
