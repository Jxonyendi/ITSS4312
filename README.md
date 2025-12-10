# Pizza Time - Ionic Mobile Application

A full-featured pizza ordering application built with Ionic and Angular, featuring real-time order tracking, user authentication, and emergency contact features.

> **👨‍💻 New to this project?** Start here: **[DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md)** - Complete setup guide for localhost development

## Features

### Core Features
- 🍕 **Pizza Ordering**: Browse specialty pizzas with beautiful images, select your favorite, and place orders
- 🛒 **Shopping Cart**: Add multiple items, manage quantities, and checkout
- 🔨 **Build Your Own Pizza**: Custom pizza builder with toppings and crust selection
- 📍 **Real-time Tracking**: Track your pizza orders with live status updates
- 🔐 **User Authentication**: Secure login and registration system with backend API or localStorage
- 💬 **AI Chat Support**: Google Gemini-powered chat widget for customer support
- 📱 **Native Integrations**: 
  - Real geolocation using Capacitor
  - SMS capabilities (with plugin installation)
  - Uber deep linking for ride requests
- 👥 **Contact Management**: Save trusted contacts for emergency messaging
- ⚙️ **Settings Page**: Customize app preferences and notifications
- 🎨 **Modern UI**: Domino's-inspired design with smooth animations

### Pages (11 total)
1. **Login Page** - User authentication and registration
2. **Home Page** - Quick actions, featured pizzas, and deals
3. **Orders Page** - Browse and order specialty pizzas
4. **Build Pizza Page** - Custom pizza builder
5. **Tracker Page** - Track active orders in real-time
6. **Order Details Page** - Detailed view of individual orders
7. **Order History Page** - View past orders
8. **Account Page** - Manage profile, contacts, and emergency settings
9. **Settings Page** - App preferences and configuration
10. **Contact Us Page** - Support, help, and AI chat widget
11. **Checkout** - Shopping cart checkout process

## Technologies Used

- **Framework**: Ionic 8 + Angular 20
- **Language**: TypeScript
- **State Management**: RxJS BehaviorSubjects
- **Backend**: Node.js + Express with MongoDB Atlas or JSON file storage
- **AI Integration**: Google Generative AI (Gemini) for chat support
- **Native Plugins**: 
  - @capacitor/geolocation - Real device location
  - @capacitor/core - Native platform detection
  - @capacitor/haptics - Haptic feedback
  - @capacitor/keyboard - Keyboard handling
  - @byteowls/capacitor-sms - SMS messaging
- **Storage**: Dual-mode (localStorage fallback + REST API with MongoDB)
- **Routing**: Angular Router with auth guards
- **Authentication**: JWT tokens with session management

## Project Structure

```
src/app/
├── login/              # Login/Registration page
├── home/               # Home page with featured pizzas
├── orders/             # Pizza ordering page
│   └── build-pizza/   # Custom pizza builder
├── tracker/            # Order tracking page
├── order-details/      # Individual order details
├── order-history/      # Past orders history
├── account/            # User account management
├── settings/           # App settings and preferences
├── contact-us/         # Support page with chat
├── services/           # Core services
│   ├── auth.service.ts        # Authentication (JWT/localStorage)
│   ├── api.service.ts         # REST API client
│   ├── cart.service.ts        # Shopping cart management
│   ├── chat.service.ts        # Gemini AI chat integration
│   ├── emergency.services.ts  # SMS, location, orders
│   ├── database.service.ts    # Local storage management
│   └── error-handler.service.ts # Error handling
├── guards/             # Route guards
│   └── auth.guard.ts          # Authentication guard
├── components/         # Reusable components
│   ├── cart-button/          # Shopping cart icon button
│   ├── cart-sidebar/         # Cart sidebar component
│   ├── checkout/              # Checkout component
│   ├── chat-widget/          # AI chat support widget
│   ├── address-display/      # Address display component
│   └── settings-button/       # Settings menu button
└── shared/             # Shared components
    └── components/
        └── pizza-card/        # Reusable pizza card component (@Input)
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Ionic CLI: `npm install -g @ionic/cli`

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ITSS4312-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Capacitor plugins** (for native features)
   ```bash
   npm install @capacitor/geolocation
   npx cap sync
   ```

4. **Run the application**
   ```bash
   # Development server
   ionic serve
   
   # Or with Angular CLI
   npm start
   ```

5. **Build for production**
   ```bash
   ionic build
   ```

### Native App Build

For iOS/Android builds:

```bash
# Add platforms
npx cap add ios
npx cap add android

# Sync native code
npx cap sync

# Open in native IDE
npx cap open ios
npx cap open android
```

## Usage

### First Time Setup

1. **Register an Account**
   - Open the app
   - Click "Register" on the login page
   - Enter username and password
   - Your account is saved locally

2. **Add Trusted Contacts**
   - Go to Account page
   - Add contact name and phone number
   - These contacts can receive emergency messages

3. **Order a Pizza**
   - Navigate to Orders page
   - Browse specialty pizzas
   - Click on a pizza to select it
   - Add delivery notes (optional)
   - Click "Place Order"
   - Track your order in the Tracker tab

### Features in Detail

#### Authentication
- **Registration**: Create account with username/password
- **Login**: Secure authentication with session management
- **Logout**: Available in Account page
- **Session Persistence**: Automatically logs you in on app restart
<img width="1912" height="943" alt="image" src="https://github.com/user-attachments/assets/6d18c71e-fb1e-4872-83aa-e2fd0edae3fd" />

#### Pizza Ordering
- Browse 6+ specialty pizzas with images
- Click to select a pizza
- View details: crust type, calories, price
- **Build Your Own Pizza**: Customize with toppings and crust
- **Shopping Cart**: Add multiple items, adjust quantities
- **Checkout**: Review order, select delivery type, add address
- Add delivery notes
- Quick-add button for fast ordering
<img width="1916" height="945" alt="image" src="https://github.com/user-attachments/assets/a0d0e396-a97f-4ee4-95ba-63d6c958a8f1" />

#### Order Tracking
- View all active orders
- See order status: placed → accepted → on the way → delivered
- **Order Details Page**: Detailed view with full order information
- **Order History**: View all past orders
- Cancel orders (if not delivered)
- Real-time status updates
<img width="1914" height="947" alt="image" src="https://github.com/user-attachments/assets/cbc6328a-8b84-4769-ad4a-fc8854f6654d" />

#### Emergency Features
- **Location**: Get real device location (requires permissions)
- **SMS**: Send messages to trusted contacts
- **Uber Integration**: Deep link to Uber app for rides
- **Pizza Code Mapping**: Map pizza toppings to emergency actions
- **Prewritten Messages**: Save custom emergency messages
<img width="1914" height="947" alt="image" src="https://github.com/user-attachments/assets/60bc8bc7-782d-4fba-a3e8-3ee3106a4aa9" />

#### AI Chat Support
- **Gemini AI Integration**: Google Generative AI-powered chat widget
- Available on multiple pages (Home, Orders, Tracker, Contact Us)
- Context-aware responses about orders, menu, and support
- Conversation history maintained during session
<img width="1908" height="947" alt="image" src="https://github.com/user-attachments/assets/068aaace-ffac-49e8-b950-4d93eaead6e6" />

## Angular Best Practices Implemented

✅ **@Input() Decorators**: Used in `PizzaCardComponent` for data binding  
✅ **Services**: `AuthService`, `ApiService`, `CartService`, `ChatService`, `EmergencyService`, `DatabaseService`, `ErrorHandlerService`  
✅ **Shared Components**: Reusable pizza card, cart, chat widget, and more  
✅ **Route Guards**: Auth guard for protected routes  
✅ **Standalone Components**: Modern Angular architecture  
✅ **RxJS Observables**: Reactive state management with BehaviorSubjects  
✅ **Dual Storage Strategy**: Seamless switching between backend API and localStorage  
✅ **AI Integration**: Google Gemini for intelligent chat support  

## Backend API

### Current Implementation
The app includes a **complete Node.js + Express backend** with:
- **Dual Storage**: Automatically switches between MongoDB Atlas and JSON file storage
- **REST API**: Full CRUD operations for users, orders, and contacts
- **JWT Authentication**: Secure token-based authentication
- **Environment-based**: Configure via `.env` file
<img width="1912" height="940" alt="image" src="https://github.com/user-attachments/assets/30b61a73-1799-4a04-96f1-7633ef68e68d" />

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment** (create `backend/.env`):
   ```env
   # For MongoDB (optional - uses JSON files if not set)
   MONGODB_URI=your-mongodb-connection-string
   
   # JWT Secret
   JWT_SECRET=your-secret-key
   
   # Server Port
   PORT=3000
   
   # Gemini API Key (for chat)
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Start backend server**
   ```bash
   node server.js
   ```

4. **Configure frontend** (update `src/environments/environment.ts`):
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api',
     useBackend: true, // Set to false for localStorage-only mode
   };
   ```

### API Endpoints

```
# Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/delete-account

# Contacts
GET    /api/contacts
POST   /api/contacts
PUT    /api/contacts/:id
DELETE /api/contacts/:id

# Orders
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id
DELETE /api/orders/:id

# Chat (Gemini AI)
POST /api/chat/message

# Contact Form
POST /api/contact/send-email
```

### Storage Modes
- **MongoDB Mode**: Set `MONGODB_URI` in `.env` → Uses MongoDB Atlas
- **JSON Mode**: No `MONGODB_URI` → Uses `backend/data/*.json` files
- **Frontend Fallback**: Set `useBackend: false` → Uses localStorage only

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

## Project Requirements Checklist

### Core Requirements (9 points)
- ✅ **20+ GitHub commits** - Track progress with regular commits
- ✅ **6+ different pages** - 11 pages implemented (Login, Home, Orders, Build Pizza, Tracker, Order Details, Order History, Account, Settings, Contact Us, Checkout)
- ✅ **Catchy name and logo** - "Pizza Time" with pizza icon
- ✅ **Screenshots in README** - Add screenshots to this file
- ✅ **@Input(), Services, Shared Modules** - All implemented
- ✅ **Node.js/MongoDB backend** - Complete backend with MongoDB Atlas and JSON fallback

### Evaluation Criteria (6 points)
- ✅ **UI Quality** - Modern, Domino's-inspired design
- ✅ **UX Quality** - Intuitive navigation, smooth animations
- ✅ **Complexity** - Authentication, real integrations, state management
- ✅ **Scope & Usability** - Full pizza ordering app with tracking
- ✅ **REST API Usage** - Ready for backend integration

## Optional Features Implemented ✅

- ✅ **Email Validation** - Optional email field in registration with validation
- ✅ **Backend API Structure** - Complete Node.js + Express + MongoDB backend ready to use
- ✅ **Keyboard Handling** - Improved keyboard behavior for form fields
- ✅ **Orientation Support** - Optimized layouts for landscape and portrait modes
- ✅ **Environment Configuration** - Easy switching between localStorage and API
- ✅ **Custom Validators** - Reusable validation utilities
- ✅ **Shopping Cart System** - Full cart management with quantities and checkout
- ✅ **AI Chat Support** - Google Gemini integration for customer support
- ✅ **Build Your Own Pizza** - Custom pizza builder with toppings selection
- ✅ **Order History & Details** - Complete order tracking and history
- ✅ **Settings Page** - App preferences and configuration
- ✅ **Dual Storage Strategy** - Automatic MongoDB/JSON file switching

See [OPTIONAL_FEATURES.md](OPTIONAL_FEATURES.md) for details on using these features.

## Future Enhancements

- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Payment integration
- [ ] User profile pictures
- [ ] Social login (Google, Facebook)
- [ ] Real-time order updates via WebSockets
- [ ] Offline mode support
- [ ] Image optimization (see [IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md))

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes.

## Authors

[Your Team Name/Names]

## Acknowledgments

- Ionic Framework team
- Angular team
- Domino's Pizza for design inspiration
