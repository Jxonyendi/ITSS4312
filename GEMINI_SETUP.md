# Gemini 2.5 Flash Live Chat Setup

The live chat feature uses Google's Gemini AI for intelligent customer support.

## Getting Your API Key

1. **Go to Google AI Studio**: https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy the API key** (it will look like: `AIzaSy...`)

## Configuration

1. **Open** `src/environments/environment.ts`
2. **Add your API key** to the `geminiApiKey` field:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useBackend: true,
  geminiApiKey: 'YOUR_API_KEY_HERE', // Paste your Gemini API key
};
```

3. **Save the file**
4. **Restart your frontend server** if it's running

## Usage

1. Go to the **Contact Us** page
2. Click **"Start Chat"** on the Live Chat card
3. The chat widget will appear at the bottom right
4. Start chatting with the AI assistant!

## Features

- ✅ Real-time AI-powered responses
- ✅ Conversation history
- ✅ Mobile-responsive design
- ✅ Typing indicators
- ✅ Timestamps on messages

## Model Information

The chat uses **Gemini 2.5 Flash** by default, which is:
- Latest and most advanced model
- Fast and efficient
- Free tier available
- Great for customer support

The model is configured in `backend/server.js`. To change it, update:
```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
```

## Troubleshooting

- **"Chat service is not configured"**: Make sure you've added your API key to `environment.ts`
- **No response**: Check your API key is valid and you have quota remaining
- **Rate limits**: Free tier has rate limits. Upgrade if needed at Google AI Studio

