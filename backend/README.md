# Pizza Time Backend API

This directory contains the backend API for the Pizza Time mobile application.

## ✅ Setup: Node.js + Express + JSON File Storage

**No MongoDB required!** Data is stored in JSON files.

### Quick Start

```bash
cd backend
npm install
npm start
```

The server will run on `http://localhost:3000`

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**Note:** No MongoDB URI needed! Data is stored in JSON files in the `data/` directory.

## 📁 Data Storage

Data is automatically stored in JSON files:
- `backend/data/users.json` - User accounts
- `backend/data/contacts.json` - Trusted contacts
- `backend/data/orders.json` - Pizza orders

You can open these files to view/edit data directly.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Contacts
- `GET /api/contacts` - Get all contacts for user
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Orders
- `GET /api/orders` - Get all orders for user
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Cancel order

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User logs in → receives JWT token
2. Token is stored in localStorage
3. Token is sent in `Authorization: Bearer <token>` header for all API requests
4. Token expires after 7 days

## 🧪 Testing

1. **Start backend**: `cd backend && npm start`
2. **Test health check**: Open `http://localhost:3000/api/health` in browser
3. **Test registration** (in browser console):
   ```javascript
   fetch('http://localhost:3000/api/auth/register', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username: 'test', password: 'test123' })
   }).then(r => r.json()).then(console.log)
   ```

## 📝 Data Structure

### Users (stored in `data/users.json`)
```json
{
  "_id": "unique-id",
  "username": "john",
  "email": "john@example.com",
  "password": "hashed-password",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Contacts (stored in `data/contacts.json`)
```json
{
  "_id": "unique-id",
  "userId": "user-id",
  "name": "Mom",
  "phone": "555-1234",
  "isPrimary": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Orders (stored in `data/orders.json`)
```json
{
  "_id": "unique-id",
  "userId": "user-id",
  "status": "placed",
  "pizzaName": "Pepperoni",
  "pizzaPrice": 14.99,
  "placedAt": 1704067200000,
  "etaMinutes": 15
}
```

## 🎯 Benefits of JSON File Storage

✅ **No database installation** - Just Node.js  
✅ **Easy to inspect** - Open JSON files to see data  
✅ **Simple setup** - No MongoDB configuration  
✅ **Data persists** - Survives server restarts  
✅ **Perfect for development** - Quick and easy  

## 🚀 Production Considerations

For production, consider:
- Using a real database (MongoDB, PostgreSQL, etc.)
- Adding data backup mechanisms
- Implementing file locking for concurrent writes
- Using a proper database for better performance

## 🔧 Troubleshooting

### "Cannot find module 'data-storage'"
- Make sure `data-storage.js` exists in the `backend/` directory

### Data not persisting
- Check that `backend/data/` directory exists
- Verify file permissions allow writing

### Port already in use
- Change `PORT` in `.env` file
- Or stop the process using port 3000

## 📚 Files

- `server.js` - Main API server
- `data-storage.js` - JSON file storage module
- `package.json` - Dependencies
- `.env` - Environment configuration (create this)
- `data/` - JSON data files (auto-created)
