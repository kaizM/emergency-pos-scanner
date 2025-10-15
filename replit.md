# Emergency POS Scanner

A free, web-based Point of Sale (POS) scanner designed for emergency use when cash registers or payment systems fail. Built with React, Express, and QuaggaJS for camera-based barcode scanning.

## Overview

This application provides a fast, mobile-friendly emergency checkout system with:
- **Camera Barcode Scanning**: Uses QuaggaJS to scan UPC/EAN barcodes via device camera
- **Pricebook Management**: Upload Excel/CSV files with product data for instant price lookup
- **Shopping Cart**: Real-time cart with quantity management and item removal
- **Tax Calculation**: Automatic 8.25% sales tax calculation
- **Payment Options**: Cash payment with change calculator and card reader instructions
- **Manual Entry**: Fallback for items not in pricebook
- **Offline Ready**: Works without internet once pricebook is loaded

## Recent Changes

### October 15, 2025 - Cigarette UPC-E Fix + Ultra-Compact Mobile UI
- **Cigarette barcodes FIXED**: UPC-E to UPC-A auto-conversion for Modisoft pricebook compatibility
- **Marlboro/Camel/Newport**: Short UPC-E codes (6-8 digits) now convert to full UPC-A (12 digits)
- **Gilbarco compatible**: Same conversion algorithm as retail POS systems
- **Ultra-compact mobile**: Scanner 120px (was 400px), cart items 60px each, see 5-6 items without scrolling
- **3-second scan delay**: Prevents duplicate scans, allows careful scanning
- **Professional accuracy**: Multi-read validation (3 confirmations), 10% error threshold, UPC-E support
- **Compact cart UI**: Horizontal layout, smaller text, maximized item visibility

### October 15, 2025 - GitHub Storage Update
- **FREE GitHub hosting**: Pricebook stored in GitHub, auto-loads from raw URL
- **No backend needed**: Everything runs client-side on Netlify (100% free)
- **Client-side parsing**: Excel/CSV upload works in browser using xlsx library
- **10,463 products**: Pre-loaded from `server/pricebook.json` on GitHub
- **Netlify config fixed**: Changed publish directory from `dist` to `dist/public`
- **1-second scan delay**: Prevents rapid duplicate scans with 3-second barcode debouncing

### October 15, 2025 - Enhanced Scanner
- **Advanced scanner**: Modisoft-level barcode detection with multi-angle, any-distance scanning
- **Auto-loaded pricebook**: 10,463 products from user's Vendors Price Book using UPC codes
- **New Transaction button**: Automatic cart clear and reset after payment completion
- **High resolution camera**: 1920x1080 with optimized autofocus and detection area
- **Multiple formats**: UPC, EAN, Code 128, Code 39, Codabar, i2of5
- **Smart column detection**: Auto-detects "Scan Code", "Item Code", "Unit Retail"

### October 15, 2025 - Initial Release
- Initial implementation of emergency POS scanner system
- Built complete frontend with barcode scanner, shopping cart, and payment flow
- Implemented backend API for pricebook upload and barcode lookup
- Added Excel/CSV file processing with automatic column detection
- Created mobile-first responsive design with dark mode support
- Integrated QuaggaJS for multi-format barcode scanning

## Project Architecture

### Frontend (React + TypeScript)
- **Main Page**: `client/src/pages/pos-scanner.tsx` - Main POS interface
- **Scanner**: `client/src/components/barcode-scanner.tsx` - Camera barcode scanning with QuaggaJS
- **Cart**: `client/src/components/shopping-cart.tsx` - Shopping cart with quantity controls
- **Payment**: `client/src/components/payment-flow.tsx` - Cash/card payment screens
- **Manual Entry**: `client/src/components/manual-entry-dialog.tsx` - Manual price entry for missing items
- **Upload**: `client/src/components/pricebook-upload.tsx` - Pricebook file upload

### Backend (Minimal - Optional)
- **Pricebook**: `server/pricebook.json` - 10,463 products stored in GitHub
- **Schema**: `shared/schema.ts` - Shared type definitions for Product, CartItem, Transaction
- Note: Backend API no longer needed - everything runs client-side!

### Key Features
1. **Barcode Scanning**
   - Multi-format support: UPC, EAN, Code 128, Code 39
   - Real-time camera feed with corner guides
   - Visual feedback on successful scan
   - Debouncing to prevent duplicate scans

2. **Pricebook Management**
   - Upload Excel (.xlsx, .xls) or CSV files
   - Automatic column detection (barcode, name, price)
   - Case-insensitive header matching
   - Validation and error reporting

3. **Shopping Cart**
   - Add/remove items
   - Quantity adjustment
   - Automatic tax calculation (8.25%)
   - Clear cart with confirmation

4. **Payment Flow**
   - Cash payment with change calculator
   - Quick amount buttons ($5, $10, $20, $50)
   - Card reader instructions
   - Payment confirmation screen

5. **Error Handling**
   - Barcode not found → Manual entry modal
   - Invalid file upload → Error messages
   - Network offline → Visual indicator
   - Camera permission denied → Error alert

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, TypeScript
- **Barcode**: QuaggaJS (@ericblade/quagga2)
- **File Processing**: xlsx library
- **Storage**: In-memory (MemStorage)
- **Styling**: Tailwind CSS with custom POS-optimized design system

## Design System

Based on Material Design principles adapted for retail/POS environments:
- **High contrast** for poor lighting conditions
- **Large touch targets** (minimum 48px) for fast interaction
- **Primary color**: Green (#228B22) for "proceed" actions
- **Semantic colors**: Blue (scanning), Amber (warning), Red (error)
- **Typography**: Inter (UI), Roboto Mono (prices/barcodes)
- **Responsive**: Mobile-first, optimized for phones and tablets

## Data Flow

1. **Pricebook Loading**:
   - App starts → Fetches from GitHub raw URL → Stores in React state (local memory)
   - Or: User uploads Excel/CSV → Parses in browser → Updates local state (temporary)

2. **Barcode Scan**:
   - Camera detects barcode → Looks up in local pricebook → Adds to cart
   - No backend API calls needed!

3. **Manual Entry**:
   - Barcode not found → Modal opens → User enters name/price → Adds to cart

4. **Checkout**:
   - User clicks checkout → Selects payment method → Processes payment → Clears cart

## User Preferences

- Tax rate: 8.25% (configurable in code)
- Supported barcode formats: UPC, EAN, Code 128, Code 39
- File upload limit: 10MB
- Target devices: Mobile phones, tablets, desktop browsers

## How to Use

1. **Upload Pricebook**:
   - Click upload icon in scanner section
   - Select Excel or CSV file with columns: Barcode, Name, Price
   - File is processed and loaded into memory

2. **Scan Items**:
   - Click "Start Scanning"
   - Point camera at barcode
   - Item automatically added to cart

3. **Manual Entry** (if needed):
   - If barcode not found, modal appears
   - Enter item name and price
   - Click "Add to Cart"

4. **Checkout**:
   - Review cart items
   - Click "Checkout"
   - Select Cash or Card
   - For cash: Enter amount, see change
   - For card: Follow external reader instructions
   - Complete payment

## Development Notes

- Workflow: "Start application" runs `npm run dev`
- Backend API prefix: `/api`
- Frontend built with Vite
- Hot reload enabled for development
- In-memory storage (data cleared on restart)
