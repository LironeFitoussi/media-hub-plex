# 🚀 MERN Stack Template with Auth0

A modern, production-ready MERN (MongoDB, Express, React, Node.js) stack template with Auth0 authentication and a beautiful iOS-inspired glassy design system.

## ✨ Features

### 🔐 Authentication
- **Auth0 Integration**: Complete JWT-based authentication system
- **Auto User Creation**: Automatic user creation on first login
- **Protected Routes**: Ready-to-use protected route components
- **Token Management**: Automatic token refresh and validation
- **Role-Based Access**: User roles system (admin, user)

### 🎨 Design System
- **iOS 26 Inspired**: Modern glassy design with glass morphism effects
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI components
- **Framer Motion**: Smooth animations and transitions
- **Responsive**: Mobile-first responsive design
- **Design Documentation**: Comprehensive design system guide included

### 🛠️ Tech Stack

#### Frontend
- **React 19** with TypeScript
- **Vite**: Lightning-fast development server
- **React Router v7**: Modern routing solution
- **Redux Toolkit**: State management
- **TanStack Query**: Server state management
- **Axios**: HTTP client
- **React Hot Toast**: Beautiful notifications

#### Backend
- **Node.js** with Express 5
- **TypeScript**: Type-safe backend code
- **MongoDB**: NoSQL database with Mongoose ODM
- **Zod**: Runtime type validation
- **Express Rate Limit**: API rate limiting
- **Morgan**: HTTP request logger
- **CORS**: Cross-origin resource sharing

### 🔒 Security Features
- JWT token validation with Auth0
- Rate limiting (10,000 requests per 15 minutes)
- CORS configuration
- Environment variable validation
- Comprehensive error handling

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Auth0 account (free tier available)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd media-hub-light
```

### 2. Setup Auth0

1. Create a free Auth0 account at [auth0.com](https://auth0.com)
2. Create a new **Application** (Single Page Application)
3. Create a new **API** in Auth0 dashboard
4. Note down:
   - Domain
   - Client ID (from Application)
   - Audience (API Identifier from API settings)

### 3. Server Setup

```bash
cd Server
npm install
```

Create a `.env` file in the Server directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/your-app-name

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
```

Start the server:
```bash
npm run dev
```

### 4. Client Setup

```bash
cd Client
npm install
```

Create a `.env` file in the Client directory:
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
```

Start the client:
```bash
npm run dev
```

### 5. Configure Auth0 Callbacks

In your Auth0 Application settings, add:
- **Allowed Callback URLs**: `http://localhost:5173`
- **Allowed Logout URLs**: `http://localhost:5173`
- **Allowed Web Origins**: `http://localhost:5173`

## 📁 Project Structure

```
media-hub-light/
├── Client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # Base UI components (shadcn)
│   │   │   ├── Atoms/      # Atomic design components
│   │   │   ├── Molecules/  # Molecular components
│   │   │   ├── Organism/   # Organism components
│   │   │   ├── AppInitializer.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux store and slices
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── main.tsx        # Entry point
│   ├── DESIGN_SYSTEM.md    # Design system documentation
│   └── package.json
│
├── Server/                  # Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── zod/            # Zod validation schemas
│   │   └── server.ts       # Entry point
│   └── package.json
│
└── README.md               # This file
```

## 🎯 Available Scripts

### Server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔑 Key Components

### AppInitializer
Handles automatic user initialization:
- Fetches Auth0 token on login
- Sets API authorization headers
- Creates user in database if not exists
- Manages user state in Redux

### ProtectedRoute
Wrapper component for protected pages:
```tsx
<ProtectedRoute requiredRole="admin">
  <YourComponent />
</ProtectedRoute>
```

### Error Handling
Comprehensive error handling system:
- Mongoose errors (validation, cast, duplicate key)
- Zod validation errors
- Custom AppError class
- Development-friendly error messages

## 🎨 Design System

The template includes a comprehensive design system inspired by iOS 26:

- **Glass Morphism**: Beautiful transparent backgrounds with blur effects
- **Consistent Colors**: Predefined color palette
- **Typography**: Clear hierarchy and readability
- **Animations**: Smooth transitions with Framer Motion
- **Components**: Ready-to-use UI components

See `Client/DESIGN_SYSTEM.md` for complete design guidelines.

## 🔧 Customization Guide

### 1. Update Branding
- Replace "YourApp" in `Header.tsx` and `Footer.tsx`
- Update page titles and meta tags
- Add your logo

### 2. Extend User Model
Edit `Server/src/models/user.model.ts`:
```typescript
const userSchema = new Schema<IUserDoc>({
  // Add your custom fields
  customField: { type: String, required: false },
});
```

### 3. Add New Routes

#### Backend
1. Create controller in `Server/src/controllers/`
2. Create route in `Server/src/routes/`
3. Add Zod validation in `Server/src/zod/`
4. Register route in `Server/src/server.ts`

#### Frontend
1. Create page component in `Client/src/pages/`
2. Add route in `Client/src/routes.tsx`
3. Create API service in `Client/src/services/`

### 4. Add New UI Components
Follow the atomic design structure:
- **Atoms**: Basic building blocks (buttons, inputs)
- **Molecules**: Simple combinations of atoms
- **Organisms**: Complex components (header, forms)

## 🚦 API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/validate` - Validate JWT token (protected)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health Check
- `GET /health` - Server health check
- `GET /danger/db-health` - Database health (dev only)

## 🐛 Troubleshooting

### Common Issues

**Auth0 Login Redirect Not Working**
- Check callback URLs in Auth0 dashboard
- Verify environment variables are correct
- Ensure Auth0 domain doesn't have `https://` prefix

**CORS Errors**
- Check `CLIENT_URL` in server `.env`
- Verify CORS configuration in `server.ts`

**Database Connection Failed**
- Check MongoDB is running
- Verify `MONGO_URI` in server `.env`
- Check network connectivity

**Token Validation Failed**
- Verify `AUTH0_AUDIENCE` matches in both client and server
- Check token hasn't expired
- Ensure Auth0 API is configured correctly

## 📚 Learn More

### Documentation
- [Auth0 Documentation](https://auth0.com/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com)

### Design Resources
- [iOS Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Glass Morphism](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)

## 🤝 Contributing

This is a template repository. Feel free to:
- Fork and modify for your projects
- Report issues or bugs
- Suggest improvements
- Share your creations

## 📝 License

ISC - Feel free to use this template for any purpose.

## 🎉 Credits

Built with ❤️ using:
- React, Express, MongoDB, Node.js
- Auth0 for authentication
- Tailwind CSS for styling
- And many other amazing open-source tools

---

**Happy coding! 🚀**

For questions or support, please open an issue on GitHub.

