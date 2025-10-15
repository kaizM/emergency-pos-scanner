# Emergency POS Scanner

A free, web-based Point of Sale (POS) scanner designed for emergency use when cash registers or payment systems fail. Built with React, Express, and QuaggaJS for advanced camera-based barcode scanning.

![Emergency POS Scanner](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Features

### 📸 Advanced Barcode Scanning
- **Multi-angle detection** - Scans barcodes upside down, sideways, at any angle
- **Any distance** - Works close-up or far away with optimized detection
- **High resolution** - Up to 1920x1080 for crystal-clear reading
- **Multiple formats** - UPC, EAN, Code 128, Code 39, Codabar, and more
- **Smart debouncing** - 1-second delay prevents duplicate scans

### 💰 Complete POS System
- **Pricebook Management** - Upload Excel/CSV with 10,000+ products
- **Shopping Cart** - Real-time cart with quantity controls
- **Tax Calculation** - Automatic 8.25% sales tax
- **Payment Options** - Cash with change calculator, card reader instructions
- **Manual Entry** - Fallback for items not in pricebook
- **Offline Ready** - Works without internet once loaded

### 🎨 Professional Design
- **Mobile-first** - Optimized for phones and tablets
- **High contrast** - Readable in any lighting condition
- **Dark mode** - Automatic theme switching
- **Touch-optimized** - Large buttons (48px minimum)
- **Fast checkout** - Every design choice prioritizes speed

## 📦 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Barcode**: QuaggaJS (advanced multi-format scanner)
- **File Processing**: xlsx (Excel/CSV parsing)
- **Storage**: In-memory (10,000+ products)

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Production Build

```bash
npm run build
```

## 📊 Pricebook Storage

**FREE GitHub Storage** - Your pricebook is stored in GitHub and auto-loads when the app starts!

- ✅ **10,463 products** pre-loaded from GitHub
- ✅ **100% Free** - No database costs
- ✅ **Always available** - Loads automatically
- ✅ **Offline ready** - Works after first load

### Excel/CSV Format

Your pricebook file should have these columns:

- **Scan Code** (UPC) - Primary barcode
- **Item Code** - Fallback if UPC empty  
- **Item Description** - Product name
- **Unit Retail** - Retail price

Example:
```csv
Scan Code,Item Description,Item Code,Unit Retail
123456789012,Premium Coffee,COFFEE01,4.99
987654321098,Energy Drink,DRINK05,2.49
```

The app automatically detects these columns (case-insensitive).

## 🔄 Workflow

1. **Upload Pricebook** - Import Excel/CSV with product data
2. **Start Scanning** - Activate camera barcode scanner
3. **Scan Items** - Point at barcode (any angle, any distance)
4. **Review Cart** - Adjust quantities, remove items
5. **Checkout** - Choose cash or card payment
6. **New Transaction** - Auto-clear cart, ready for next customer

## 🌐 Deployment

### Netlify (Recommended)

1. Push to GitHub (see below)
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### GitHub Setup

Run the push script:

```bash
tsx scripts/push-to-github.ts "Initial deployment"
```

Or manually:

```bash
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/emergency-pos-scanner.git
git push -u origin main
```

## 🎯 Scanner Configuration

Advanced settings for optimal barcode detection:

- **Resolution**: 1920x1080 (adjusts for device)
- **Detection area**: 60% center focus
- **Scan delay**: 1 second between scans
- **Debounce**: 3 seconds for same barcode
- **Multi-threading**: Uses all CPU cores

## 📱 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Safari (iOS 14.3+)
- ✅ Firefox
- ✅ Mobile browsers with camera access

## 🔒 Security

- No data stored externally
- In-memory storage only
- No API keys required
- Camera permission managed by browser
- Offline-capable for security

## 📄 License

MIT License - Free to use for commercial and personal projects

## 🤝 Contributing

Contributions welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 🆘 Troubleshooting

### Camera not working?
- Check browser permissions
- Use HTTPS (required for camera)
- Try different browser

### Barcode not scanning?
- Ensure good lighting
- Hold steady for 1 second
- Try different angles
- Check barcode format (UPC/EAN supported)

### Pricebook upload fails?
- Check file format (Excel or CSV)
- Verify column headers
- Ensure prices are numeric
- Check file size (<10MB)

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check documentation
- Review troubleshooting guide

---

Built with ❤️ for retail workers everywhere
