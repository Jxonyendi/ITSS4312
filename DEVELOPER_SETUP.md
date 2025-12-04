# Developer Setup Guide

This guide will help you set up the Pizza Time app on your local machine. Follow these steps to get the application running on localhost.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **A code editor** (VS Code or Cursor recommended)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Jxonyendi/ITSS4312.git
cd ITSS4312-main
```

### 2. Install Frontend Dependencies

```bash
npm install
```

This will install all Angular/Ionic dependencies for the frontend application.

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Set Up Environment Variables

#### Frontend Environment

The frontend uses `src/environments/environment.ts` which is already configured. No changes needed unless you want to modify the API URL.

#### Backend Environment

Create a `.env` file in the `backend/` directory:

```bash
cd backend
```

Create `backend/.env` with the following content:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Optional - for email support feature)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Gemini AI Configuration (Optional - for live chat feature)
GEMINI_API_KEY=your-gemini-api-key-here
```

**Note:** 
- Replace `JWT_SECRET` with a random string (at least 32 characters)
- For email support, see `backend/EMAIL_SETUP.md`
- For Gemini AI chat, see `GEMINI_SETUP.md`

### 5. Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

The backend server will start on `http://localhost:3000`

You should see:
```
✓ Server running on port 3000
✓ Data storage initialized
```

### 6. Start the Frontend Development Server

Open a **new terminal** (keep the backend running) and run:

```bash
npm start
```

The frontend will start on `http://localhost:4200`

You should see:
```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

### 7. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000

## Project Structure

```
ITSS4312-main/
├── backend/                 # Node.js/Express backend
│   ├── data/               # JSON file storage (gitignored)
│   ├── node_modules/      # Backend dependencies (gitignored)
│   ├── server.js          # Main backend server
│   ├── data-storage.js    # JSON file storage module
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables (gitignored)
│
├── src/                    # Angular/Ionic frontend
│   ├── app/               # Application code
│   │   ├── components/    # Reusable components
│   │   ├── services/      # Services (API, Auth, Chat, etc.)
│   │   ├── guards/        # Route guards
│   │   └── [pages]/       # Page components
│   ├── assets/            # Static assets (images, etc.)
│   └── environments/      # Environment configuration
│
├── package.json           # Frontend dependencies
└── angular.json          # Angular configuration
```

## Key Technologies

### Frontend
- **Angular** (v17+) - Framework
- **Ionic** (v7+) - UI components
- **TypeScript** - Language
- **RxJS** - Reactive programming

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **JSON File Storage** - Data persistence (no database required)
- **JWT** - Authentication
- **Nodemailer** - Email sending
- **Google Generative AI** - Chat functionality

## Common Issues and Solutions

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

Or change the port in `backend/.env`:
```env
PORT=3001
```

### Issue: Frontend Can't Connect to Backend

**Error:** `Failed to fetch` or `Network error`

**Solutions:**
1. Ensure the backend server is running on port 3000
2. Check `src/environments/environment.ts` has correct API URL:
   ```typescript
   apiUrl: 'http://localhost:3000/api'
   ```
3. Check browser console for CORS errors (should be handled by backend)

### Issue: Module Not Found

**Error:** `Cannot find module '...'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Errors

**Error:** Various TypeScript compilation errors

**Solution:**
1. Ensure all dependencies are installed
2. Restart the development server
3. Clear Angular cache:
   ```bash
   rm -rf .angular
   npm start
   ```

### Issue: Backend Data Not Persisting

**Solution:**
- Data is stored in `backend/data/*.json` files
- These files are gitignored (not in repository)
- They will be created automatically on first run
- If data is lost, the files may have been deleted - restart the backend

### Issue: Authentication Not Working

**Solution:**
1. Check `backend/.env` has `JWT_SECRET` set
2. Ensure backend server is running
3. Check browser console for API errors
4. Try clearing browser localStorage:
   ```javascript
   localStorage.clear()
   ```

## Development Workflow

### Making Changes

1. **Frontend Changes:**
   - Edit files in `src/app/`
   - The dev server will auto-reload
   - Check browser console for errors

2. **Backend Changes:**
   - Edit files in `backend/`
   - Restart the backend server (Ctrl+C, then `npm start`)
   - Or use nodemon for auto-reload:
     ```bash
     cd backend
     npx nodemon server.js
     ```

### Testing API Endpoints

You can test the backend API using:

**Browser:**
- http://localhost:3000 (shows API info)

**cURL or Postman:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

## Environment Configuration

### Frontend Environment (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useBackend: true,  // Set to false to use localStorage instead
};
```

### Backend Environment (`backend/.env`)

```env
PORT=3000
JWT_SECRET=your-secret-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
GEMINI_API_KEY=your-gemini-api-key
```

## Optional Features Setup

### Email Support

See `backend/EMAIL_SETUP.md` for detailed instructions on setting up email functionality.

### Gemini AI Chat

See `GEMINI_SETUP.md` for instructions on setting up the AI chat feature.

## Troubleshooting Checklist

- [ ] Node.js and npm are installed and up to date
- [ ] All dependencies are installed (`npm install` in root and `backend/`)
- [ ] Backend `.env` file exists and has required variables
- [ ] Backend server is running on port 3000
- [ ] Frontend server is running on port 4200
- [ ] No port conflicts (3000, 4200)
- [ ] Browser console shows no errors
- [ ] Network tab shows API calls to `localhost:3000`

## Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Check the terminal where the servers are running
3. Review this guide's "Common Issues" section
4. Check the other documentation files:
   - `SETUP.md` - General setup
   - `REST_API_SETUP.md` - API documentation
   - `GEMINI_SETUP.md` - AI chat setup
   - `backend/EMAIL_SETUP.md` - Email setup

## For AI Assistants (Cursor/VSCode Agents)

### Project Context

This is an Ionic/Angular mobile application with a Node.js/Express backend. The app is designed as a pizza ordering app that also functions as a discreet emergency services tool.

### Key Files to Understand

- **Backend Entry:** `backend/server.js`
- **Frontend Entry:** `src/main.ts`
- **API Service:** `src/app/services/api.service.ts`
- **Auth Service:** `src/app/services/auth.service.ts`
- **Emergency Service:** `src/app/services/emergency.services.ts`
- **Data Storage:** `backend/data-storage.js` (JSON file-based)

### Architecture

- **Frontend:** Angular standalone components, Ionic UI, RxJS for async operations
- **Backend:** Express REST API, JWT authentication, JSON file storage (no database)
- **Communication:** HTTP requests from frontend to backend API
- **State Management:** Services with RxJS BehaviorSubjects

### Common Tasks

1. **Adding a new API endpoint:**
   - Add route in `backend/server.js`
   - Add method in `src/app/services/api.service.ts` (if needed)
   - Use in components via `ApiService`

2. **Adding a new page:**
   - Create component in `src/app/[page-name]/`
   - Add route in `src/app/app.routes.ts`
   - Import Ionic components as standalone

3. **Modifying data models:**
   - Update interfaces in service files
   - Update `data-storage.js` if backend changes needed

### Dependencies

**Frontend:**
- `@ionic/angular` - UI framework
- `@angular/core` - Angular framework
- `rxjs` - Reactive programming

**Backend:**
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `nodemailer` - Email sending
- `@google/generative-ai` - Gemini AI
- `dotenv` - Environment variables

### Development Commands

```bash
# Frontend
npm start              # Start dev server (port 4200)
npm run build          # Build for production

# Backend
cd backend
npm start              # Start server (port 3000)
npx nodemon server.js  # Start with auto-reload
```

### Important Notes for AI Assistants

- The app uses **standalone Angular components** (no NgModules)
- All Ionic components must be imported individually in component files
- The backend uses **JSON file storage** - no database queries
- Authentication uses **JWT tokens** stored in localStorage
- The app has both **pizza ordering** and **emergency services** features
- All API responses follow the format: `{ success: boolean, data?: any, message?: string, error?: string }`

