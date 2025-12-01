# Setup Guide - Pizza Time App

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Capacitor Plugins
```bash
# Geolocation (already in package.json, just sync)
npm install @capacitor/geolocation
npx cap sync
```

### 3. Optional: Install SMS Plugin (for real SMS sending)
```bash
npm install @capacitor-community/sms
npx cap sync
```

Then update `emergency.services.ts` to use:
```typescript
import { SMS } from '@capacitor-community/sms';
// In sendMockSms method:
const result = await SMS.send({ numbers: [phone], text: msg });
```

### 4. Run the App
```bash
# Development
ionic serve
# or
npm start

# The app will open at http://localhost:8100
```

## First Time Login

1. Open the app in your browser
2. Click "Register" on the login page
3. Create an account with:
   - Username: `testuser`
   - Password: `password123`
4. You'll be automatically logged in

## Testing Features

### Test Authentication
- Register a new user
- Logout from Account page
- Login again with your credentials

### Test Pizza Ordering
1. Go to Orders tab
2. Click on any pizza card to select it
3. Add a delivery note (optional)
4. Click "Place Order"
5. You'll be redirected to Tracker to see your order

### Test Location
- The app will request location permissions
- On browser: Allow location access
- On device: Grant location permissions in settings

### Test Contacts
1. Go to Account page
2. Add a contact:
   - Name: `Emergency Contact`
   - Phone: `+1234567890`
3. The contact is saved and can receive messages

## Building for Device

### Android
```bash
npx cap add android
npx cap sync
npx cap open android
# Build in Android Studio
```

### iOS
```bash
npx cap add ios
npx cap sync
npx cap open ios
# Build in Xcode
```

## Permissions Required

### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.SEND_SMS" />
```

### iOS (ios/App/App/Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to deliver your pizza</string>
```

## Troubleshooting

### Geolocation not working
- Check browser permissions (Settings > Privacy > Location)
- On device: Grant location permissions in app settings
- Ensure HTTPS (required for geolocation in browsers)

### SMS not sending
- Install `@capacitor-community/sms` plugin
- Grant SMS permissions on device
- Check phone number format (include country code)

### Login not working
- Clear browser localStorage: `localStorage.clear()`
- Check browser console for errors
- Ensure you're using a valid username/password

## Development Tips

1. **Hot Reload**: Changes auto-reload in browser
2. **Console Logs**: Check browser DevTools for debugging
3. **State Management**: All state is in services, check `emergency.services.ts`
4. **Routing**: Protected routes require authentication (see `auth.guard.ts`)

## Next Steps for Production

1. **Backend API**: Replace localStorage with HTTP calls
2. **Database**: Connect to MongoDB or PostgreSQL
3. **Authentication**: Use JWT tokens
4. **Push Notifications**: Integrate Firebase Cloud Messaging
5. **Payment**: Add Stripe or PayPal
6. **Analytics**: Add Google Analytics or similar

