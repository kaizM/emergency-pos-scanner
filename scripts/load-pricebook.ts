import * as XLSX from "xlsx";
import { readFileSync, writeFileSync } from "fs";
import { Product } from "../shared/schema";

const filePath = process.argv[2] || "attached_assets/Vendors Price Book_1760541915517.xlsx";

try {
  console.log(`Loading pricebook from: ${filePath}`);
  
  const fileBuffer = readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
  
  console.log(`Found ${jsonData.length} rows in the file`);
  
  // Parse products using the specific column structure
  const products: Product[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < jsonData.length; i++) {
    const row: any = jsonData[i];
    
    // Use Scan Code as primary barcode, fallback to Item Code
    let barcode = String(row["Scan Code"] || "").trim();
    
    // If Scan Code is empty or just a dot, use Item Code
    if (!barcode || barcode === "." || barcode === "0") {
      barcode = String(row["Item Code"] || "").trim();
    }
    
    const name = String(row["Item Description"] || "").trim();
    const priceStr = String(row["Unit Retail"] || "0").replace(/[^0-9.]/g, '');
    const price = parseFloat(priceStr);
    
    // Skip if no valid barcode, name, or price
    if (!barcode || !name || isNaN(price) || price <= 0) {
      if (errors.length < 10) {
        errors.push(`Row ${i + 2}: Invalid (barcode: "${barcode}", name: "${name}", price: ${price})`);
      }
      continue;
    }
    
    products.push({
      barcode,
      name,
      price,
    });
  }
  
  console.log(`\n✅ Successfully parsed ${products.length} products`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  Skipped ${errors.length} rows (showing first 10):`);
    errors.slice(0, 10).forEach(err => console.log(`  ${err}`));
  }
  
  // Save to JSON file
  const outputPath = "server/pricebook.json";
  writeFileSync(outputPath, JSON.stringify(products, null, 2));
  console.log(`\n📦 Saved ${products.length} products to ${outputPath}`);
  
  // Show sample products
  console.log(`\nSample products:`);
  products.slice(0, 10).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.barcode} - ${p.name} - $${p.price.toFixed(2)}`);
  });
  
  console.log(`\n✨ Pricebook ready to use! You can now upload it via the app.`);
  
} catch (error) {
  console.error("Error processing pricebook:", error);
  process.exit(1);
}
