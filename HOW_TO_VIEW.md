# How to View the Pizza Time App

## Quick Start Guide

### Option 1: Run Development Server (Recommended)

1. **Open Terminal/Command Prompt** in the project directory:
   ```bash
   cd C:\Users\nithi\Downloads\ITSS4312-main
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   
   Or using Angular CLI directly:
   ```bash
   ng serve
   ```

4. **Open in browser**:
   - The terminal will show: `Local: http://localhost:4200/`
   - Open your browser and go to: **http://localhost:4200**
   - The app will automatically reload when you make changes

### Option 2: Using Ionic CLI

1. **Install Ionic CLI globally** (if not installed):
   ```bash
   npm install -g @ionic/cli
   ```

2. **Run the app**:
   ```bash
   ionic serve
   ```

3. **Open in browser**: http://localhost:8100

### Option 3: Build and View Production Version

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Serve the built files**:
   ```bash
   npx http-server www -p 8080
   ```

3. **Open in browser**: http://localhost:8080

## Viewing on Mobile Device

### Option 1: Browser Dev Tools (Easiest)

1. Run `npm start`
2. Open browser DevTools (F12)
3. Click device toolbar icon (or press Ctrl+Shift+M)
4. Select a mobile device (iPhone, Android, etc.)
5. Refresh the page

### Option 2: Network Access (Same WiFi)

1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Start server with host flag:
   ```bash
   ng serve --host 0.0.0.0
   ```

3. On your phone, open browser and go to:
   ```
   http://YOUR_IP_ADDRESS:4200
   ```
   Example: `http://192.168.1.100:4200`

### Option 3: Native App (iOS/Android)

1. **Install Capacitor CLI** (if needed):
   ```bash
   npm install -g @capacitor/cli
   ```

2. **Add platform**:
   ```bash
   npx cap add ios
   # or
   npx cap add android
   ```

3. **Build the app**:
   ```bash
   npm run build
   ```

4. **Sync with native project**:
   ```bash
   npx cap sync
   ```

5. **Open in native IDE**:
   ```bash
   npx cap open ios    # Opens Xcode
   npx cap open android # Opens Android Studio
   ```

## Troubleshooting

### Port Already in Use

If port 4200 is busy, use a different port:
```bash
ng serve --port 4201
```

### Dependencies Not Installed

If you see errors, install dependencies:
```bash
npm install
```

### Build Errors

Clear cache and rebuild:
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm start
```

## First Time Setup

1. **Register a new account**:
   - Go to Login page
   - Click "Register"
   - Enter username, optional email, and password
   - Click "Register"

2. **Add contacts**:
   - Go to Account tab
   - Add trusted contacts with name and phone

3. **Order a pizza**:
   - Go to Order tab
   - Select a pizza
   - Add delivery notes (optional)
   - Click "Place Order"

4. **Track your order**:
   - Go to Tracker tab
   - See order status updates

## Browser Compatibility

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Development vs Production

- **Development** (`npm start`): Hot reload, source maps, debugging
- **Production** (`npm run build -- --configuration production`): Optimized, minified, faster

## Quick Commands Reference

```bash
# Start development server
npm start

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test

# Build and watch for changes
npm run watch
```

## Need Help?

- Check the browser console (F12) for errors
- Check terminal output for build errors
- Ensure Node.js version is 18+ (`node --version`)
- Ensure all dependencies are installed (`npm install`)


