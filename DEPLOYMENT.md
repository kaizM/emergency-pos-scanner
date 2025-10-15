# 🚀 Deployment Guide

## Quick Deploy to GitHub & Netlify

### Step 1: Push to GitHub (Automated)

Run this command to automatically create a GitHub repository and push your code:

```bash
tsx scripts/push-to-github.ts "Initial deployment"
```

This will:
- ✅ Create a new repository called `emergency-pos-scanner`
- ✅ Push all your code to GitHub
- ✅ Give you the repository URL

### Step 2: Deploy to Netlify

1. **Go to Netlify**
   - Visit: https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"

2. **Connect GitHub**
   - Select "GitHub" as the provider
   - Find and select your `emergency-pos-scanner` repository

3. **Configure Build**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - Click "Deploy site"

4. **Wait for Deployment**
   - Netlify will build and deploy your app (2-3 minutes)
   - You'll get a live URL like: `https://your-app.netlify.app`

5. **Custom Domain (Optional)**
   - In Netlify dashboard → Domain settings
   - Add your custom domain
   - Follow DNS configuration steps

## Manual GitHub Push (Alternative)

If the automated script doesn't work, use these commands:

```bash
# Initialize git
git init

# Add all files
git add -A

# Commit
git commit -m "Deploy Emergency POS Scanner"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/emergency-pos-scanner.git

# Push to GitHub
git push -u origin main --force
```

## Important Notes

### ⚠️ Before Deploying

1. **Pricebook**: Your pricebook with 10,463 products is in `server/pricebook.json`
   - This file is NOT committed to GitHub (in .gitignore)
   - You'll need to re-upload your Excel file in production
   - Or manually add pricebook.json to your repository if you want it auto-loaded

2. **Environment**: The app runs on Netlify's static hosting
   - Frontend will be fully functional
   - For full backend features, consider:
     - Netlify Functions (for serverless API)
     - Or deploy backend separately (Heroku, Railway, etc.)

3. **Pricebook in Production**:
   - Option A: Upload Excel via the app (recommended)
   - Option B: Include pricebook.json in git (remove from .gitignore)

### 🔧 Configuration Files

- `netlify.toml` - Netlify configuration (build settings, redirects)
- `.gitignore` - Files excluded from GitHub
- `README.md` - Project documentation

### 📝 Build Settings

The build command in package.json:
```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```

This creates:
- `dist/` - Production-ready frontend
- Optimized for fast loading
- All assets bundled

## Troubleshooting

### Git Errors
- If "remote already exists": `git remote remove origin` then try again
- If push rejected: Use `--force` flag (be careful!)

### Netlify Build Fails
- Check Node version (should be 20)
- Verify all dependencies are in package.json
- Check build logs in Netlify dashboard

### Pricebook Not Loading
- Upload Excel file via app interface
- Or add server/pricebook.json to git (remove from .gitignore)

## 🎉 Success!

Once deployed:
- Your app is live 24/7
- Access from any device
- Share URL with your team
- SSL/HTTPS automatic
- CDN for fast loading worldwide

---

Need help? Check the main README.md or open an issue on GitHub!
