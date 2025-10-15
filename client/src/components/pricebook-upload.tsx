import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Check, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface PricebookUploadProps {
  onUploadComplete: () => void;
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
      const formData = new FormData();
      formData.append("pricebook", file);

      const response = await fetch("/api/pricebook/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message,
          itemCount: result.itemCount,
        });
        toast({
          title: "Upload Successful",
          description: `${result.itemCount} items loaded into pricebook`,
          className: "bg-primary text-primary-foreground",
        });
        setTimeout(() => {
          onUploadComplete();
        }, 1500);
      } else {
        setUploadResult({
          success: false,
          message: result.message || "Upload failed",
        });
        toast({
          title: "Upload Failed",
          description: result.message || "Could not process pricebook",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        message: "Network error. Please try again.",
      });
      toast({
        title: "Upload Error",
        description: "Could not connect to server",
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
        <p>• Column headers: Barcode, Name, Price</p>
        <p>• First row should contain headers</p>
        <p>• Barcodes should be UPC/EAN format</p>
      </div>
    </div>
  );
}
