# REST API Implementation Guide

## ✅ Implementation Complete

The REST API has been successfully integrated into the Pizza Time app. The app now supports both:
- **REST API mode** (when `useBackend: true` in environment.ts)
- **localStorage mode** (fallback when backend is unavailable)

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm install
node server.js
```

The server will run on `http://localhost:3000`

### 2. Configure Environment

The environment is already configured in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useBackend: true, // ✅ Already enabled
};
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Then update backend/.env:
MONGODB_URI=mongodb://localhost:27017/pizza-time
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pizza-time
```

### 4. Create Backend .env File

Create `backend/.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pizza-time
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

### 5. Run the App

```bash
# In the main directory
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User logs in → receives JWT token
2. Token is stored in localStorage
3. Token is sent in `Authorization: Bearer <token>` header for all API requests
4. Token expires after 7 days

## 🔄 How It Works

### When `useBackend: true`:
- All data operations go through REST API
- Data is stored in MongoDB database
- Authentication uses JWT tokens
- Data persists across devices

### When `useBackend: false`:
- Falls back to localStorage
- Data stored in browser only
- No authentication required
- Data lost if cache cleared

## 🧪 Testing

1. **Start backend**: `cd backend && node server.js`
2. **Start frontend**: `npm start`
3. **Register a user** in the app
4. **Add contacts** - they'll be saved to MongoDB
5. **Place orders** - they'll be saved to MongoDB
6. **Check MongoDB** to see the data:
   ```bash
   mongosh
   use pizza-time
   db.users.find()
   db.contacts.find()
   db.orders.find()
   ```

## 🐛 Troubleshooting

### "Network error" or "Failed to connect"
- Make sure backend server is running on port 3000
- Check `apiUrl` in `environment.ts` matches your backend URL
- Check CORS is enabled in backend (it is by default)

### "Unauthorized" errors
- User needs to log in first
- Token might be expired - try logging out and back in
- Check JWT_SECRET in backend/.env matches

### Data not saving
- Check MongoDB connection
- Check backend console for errors
- Verify `useBackend: true` in environment.ts

## 📝 Code Changes Made

### Updated Files:
1. ✅ `src/environments/environment.ts` - Enabled backend
2. ✅ `src/app/services/api.service.ts` - Added auth token support
3. ✅ `src/app/services/auth.service.ts` - Uses REST API for auth
4. ✅ `src/app/services/emergency.services.ts` - Uses REST API for contacts/orders
5. ✅ `src/app/account/account.page.ts` - Updated to await async methods
6. ✅ `src/app/tracker/tracker.page.ts` - Updated to await async methods
7. ✅ `src/app/order-details/order-details.page.ts` - Updated to await async methods

## 🎯 Next Steps

1. **Set up MongoDB** (local or Atlas)
2. **Start backend server**
3. **Test the app** - register, login, add contacts, place orders
4. **Deploy backend** to production (Heroku, AWS, etc.)
5. **Update production environment** with production API URL

## 📚 Additional Resources

- Backend code: `backend/server.js`
- API documentation: `backend/README.md`
- Environment config: `src/environments/environment.ts`

