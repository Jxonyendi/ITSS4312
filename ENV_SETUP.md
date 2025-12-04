# Environment Variables Setup

## Option 1: Direct Setup (Recommended for Development)

Simply add your Gemini API key directly to `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useBackend: true,
  geminiApiKey: 'YOUR_ACTUAL_API_KEY_HERE', // Paste your key here
};
```

**Steps:**
1. Get your API key from: https://aistudio.google.com/app/apikey
2. Open `src/environments/environment.ts`
3. Replace `'your-api-key-here'` with your actual API key
4. Save the file
5. Restart your frontend server

## Option 2: Using .env File

A `.env` file has been created in the project root. To use it:

1. **Open `.env` file** in the project root
2. **Replace** `your-api-key-here` with your actual Gemini API key:
   ```
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```
3. **Update `src/environments/environment.ts`** to read from the .env file:

```typescript
// At the top of the file
declare const process: any;

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useBackend: true,
  geminiApiKey: process.env['GEMINI_API_KEY'] || '', // Reads from .env
};
```

**Note:** For Angular/Ionic frontend apps, environment variables from `.env` files are not automatically available at runtime because the code runs in the browser. You would need additional build configuration to inject them.

## Recommended Approach

For development, **Option 1** (direct in environment.ts) is simpler and works immediately.

For production, consider:
- Using environment-specific files (`environment.prod.ts`)
- Storing sensitive keys on the backend and proxying API calls
- Using Angular's file replacement during build

## Security Note

⚠️ **Important:** API keys in frontend code are visible to anyone who inspects your app. For production:
- Consider proxying Gemini API calls through your backend
- Use backend environment variables for sensitive keys
- Implement rate limiting and authentication

