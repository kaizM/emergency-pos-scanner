import { Product } from "@shared/schema";

export interface IStorage {
  // Pricebook operations
  getPricebookItems(): Promise<Product[]>;
  getPricebookItemByBarcode(barcode: string): Promise<Product | undefined>;
  setPricebook(products: Product[]): Promise<void>;
  clearPricebook(): Promise<void>;
}

export class MemStorage implements IStorage {
  private pricebook: Map<string, Product>;

  constructor() {
    this.pricebook = new Map();
  }

  async getPricebookItems(): Promise<Product[]> {
    return Array.from(this.pricebook.values());
  }

  async getPricebookItemByBarcode(barcode: string): Promise<Product | undefined> {
    return this.pricebook.get(barcode);
  }

  async setPricebook(products: Product[]): Promise<void> {
    this.pricebook.clear();
    for (const product of products) {
      this.pricebook.set(product.barcode, product);
    }
  }

  async clearPricebook(): Promise<void> {
    this.pricebook.clear();
  }
}

export const storage = new MemStorage();
