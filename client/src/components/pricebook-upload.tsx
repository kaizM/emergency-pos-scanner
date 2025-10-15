import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Check, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";
import * as XLSX from "xlsx";

interface PricebookUploadProps {
  onUploadComplete: (products: Product[]) => void;
}

export function PricebookUpload({ onUploadComplete }: PricebookUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    itemCount?: number;
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];
      
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.endsWith('.xlsx') && 
          !selectedFile.name.endsWith('.xls') && 
          !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel (.xlsx, .xls) or CSV file",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

      if (!jsonData || jsonData.length === 0) {
        throw new Error("No data found in file");
      }

      // Map columns - case insensitive search for barcode, name, price
      const products: Product[] = jsonData.map((row) => {
        const keys = Object.keys(row);
        
        // Find barcode column (priority: "Scan Code" > "Item Code" > "barcode" > "upc")
        const barcodeKey = keys.find(k => 
          k.toLowerCase().includes("scan code") ||
          k.toLowerCase().includes("item code") ||
          k.toLowerCase() === "barcode" ||
          k.toLowerCase() === "upc"
        ) || keys[0];
        
        // Find name column
        const nameKey = keys.find(k => 
          k.toLowerCase().includes("description") ||
          k.toLowerCase().includes("name") ||
          k.toLowerCase().includes("item")
        ) || keys[1];
        
        // Find price column (priority: "Unit Retail" > "price" > "retail")
        const priceKey = keys.find(k => 
          k.toLowerCase().includes("unit retail") ||
          k.toLowerCase().includes("retail") ||
          k.toLowerCase() === "price"
        ) || keys[2];

        const barcode = String(row[barcodeKey] || "").trim();
        const name = String(row[nameKey] || "Unknown").trim();
        const price = parseFloat(String(row[priceKey] || "0").replace(/[^0-9.]/g, ""));

        return { barcode, name, price };
      }).filter(p => p.barcode && p.price > 0);

      if (products.length === 0) {
        throw new Error("No valid products found");
      }

      setUploadResult({
        success: true,
        message: "Pricebook loaded (session only - not saved to GitHub)",
        itemCount: products.length,
      });
      
      toast({
        title: "Upload Successful",
        description: `${products.length} items loaded (temporary)`,
        className: "bg-primary text-primary-foreground",
      });

      setTimeout(() => {
        onUploadComplete(products);
      }, 1500);
      
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to process file",
      });
      toast({
        title: "Upload Error",
        description: "Could not parse pricebook file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pricebook-file">Upload Pricebook</Label>
        <div className="flex items-center gap-2">
          <Input
            id="pricebook-file"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={uploading}
            data-testid="input-pricebook-file"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Supported formats: Excel (.xlsx, .xls) or CSV
        </p>
      </div>

      {file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
          </AlertDescription>
        </Alert>
      )}

      {uploadResult && (
        <Alert variant={uploadResult.success ? "default" : "destructive"}>
          {uploadResult.success ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {uploadResult.message}
            {uploadResult.itemCount && (
              <span className="block mt-1 font-semibold">
                {uploadResult.itemCount} items loaded
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full"
        data-testid="button-upload-pricebook"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Pricebook
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Expected format:</p>
        <p>• Scan Code (UPC), Item Description, Unit Retail</p>
        <p>• First row should contain headers</p>
        <p>• Note: Changes are temporary (session only)</p>
      </div>
    </div>
  );
}
