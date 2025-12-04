# Quick Start Guide - Node.js Backend

## ✅ Setup Complete!

Your backend now uses **Node.js with JSON file storage** - no MongoDB needed!

## 🚀 Get It Running (3 Steps)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start the Server
```bash
node server.js
```

You should see:
```
🚀 Server running on port 3000
📡 API available at http://localhost:3000/api
💾 Using JSON file storage (no MongoDB required)
📁 Data stored in: C:\Users\...\backend\data\
```

### Step 3: Test It Works
Open your browser and go to:
```
http://localhost:3000/api/health
```

You should see: `{"success":true,"message":"API is running","storage":"JSON file storage"}`

## ✅ That's It!

Your REST API is now running! The frontend app will automatically connect to it.

## 📁 Where is Data Stored?

Data is saved in JSON files:
- `backend/data/users.json` - All user accounts
- `backend/data/contacts.json` - All contacts
- `backend/data/orders.json` - All orders

You can open these files to see your data!

## 🧪 Test the API

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"test\",\"password\":\"test123\"}"
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"test\",\"password\":\"test123\"}"
```

## 🎯 Next Steps

1. Start the backend: `cd backend && node server.js`
2. Start the frontend: `npm start` (in main directory)
3. Open the app and register/login
4. Check `backend/data/` folder to see your data!

## 🐛 Troubleshooting

**Port 3000 already in use?**
- Change `PORT=3001` in `backend/.env`
- Update `apiUrl` in `src/environments/environment.ts` to match

**"Cannot find module" errors?**
- Run `npm install` in the `backend/` directory

**Data not saving?**
- Check that `backend/data/` directory exists
- Check file permissions

