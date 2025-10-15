import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as XLSX from "xlsx";
import { Product, productSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload pricebook (Excel or CSV)
  app.post("/api/pricebook/upload", upload.single("pricebook"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "No file uploaded" 
        });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "File is empty or invalid format"
        });
      }

      // Parse and validate products
      const products: Product[] = [];
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        
        // Try to find barcode, name, and price columns (case-insensitive)
        const barcodeKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('barcode') || 
          key.toLowerCase().includes('upc') || 
          key.toLowerCase().includes('ean') ||
          key.toLowerCase().includes('code')
        );
        
        const nameKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('name') || 
          key.toLowerCase().includes('product') || 
          key.toLowerCase().includes('item') ||
          key.toLowerCase().includes('description')
        );
        
        const priceKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('price') || 
          key.toLowerCase().includes('cost') ||
          key.toLowerCase().includes('amount')
        );

        if (!barcodeKey || !nameKey || !priceKey) {
          errors.push(`Row ${i + 2}: Missing required columns (barcode, name, price)`);
          continue;
        }

        const barcode = String(row[barcodeKey]).trim();
        const name = String(row[nameKey]).trim();
        const priceValue = parseFloat(String(row[priceKey]).replace(/[^0-9.]/g, ''));

        if (!barcode || !name || isNaN(priceValue) || priceValue <= 0) {
          errors.push(`Row ${i + 2}: Invalid data`);
          continue;
        }

        try {
          const product = productSchema.parse({
            barcode,
            name,
            price: priceValue,
          });
          products.push(product);
        } catch (validationError) {
          errors.push(`Row ${i + 2}: Validation failed`);
        }
      }

      if (products.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid products found in file",
          errors: errors.slice(0, 5), // Return first 5 errors
        });
      }

      // Store products in pricebook
      await storage.setPricebook(products);

      res.json({
        success: true,
        message: `Successfully uploaded ${products.length} items`,
        itemCount: products.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      });

    } catch (error) {
      console.error("Pricebook upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process pricebook file",
      });
    }
  });

  // Lookup product by barcode
  app.get("/api/pricebook/lookup/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      
      if (!barcode) {
        return res.status(400).json({ message: "Barcode is required" });
      }

      const product = await storage.getPricebookItemByBarcode(barcode);

      if (!product) {
        return res.status(404).json({ 
          message: "Product not found in pricebook" 
        });
      }

      res.json(product);
    } catch (error) {
      console.error("Barcode lookup error:", error);
      res.status(500).json({ message: "Failed to lookup product" });
    }
  });

  // Get all pricebook items (optional - for debugging)
  app.get("/api/pricebook", async (req, res) => {
    try {
      const items = await storage.getPricebookItems();
      res.json({ 
        items,
        count: items.length 
      });
    } catch (error) {
      console.error("Get pricebook error:", error);
      res.status(500).json({ message: "Failed to get pricebook" });
    }
  });

  // Clear pricebook (optional - for testing)
  app.delete("/api/pricebook", async (req, res) => {
    try {
      await storage.clearPricebook();
      res.json({ success: true, message: "Pricebook cleared" });
    } catch (error) {
      console.error("Clear pricebook error:", error);
      res.status(500).json({ message: "Failed to clear pricebook" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
