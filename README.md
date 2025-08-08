# SSO (Single Sign-On) Proof of Concept

This is a comprehensive SSO implementation demonstrating how multiple applications can share authentication using a centralized authentication server.

##  Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Server   │    │     App A       │    │     App B       │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 3002)   │
│                 │    │                 │    │                 │
│  - Login        │◄──►│  - Protected    │    │  - Protected    │
│  - Logout       │    │    Routes       │    │    Routes       │
│  - Token        │    │  - SSO Flow     │    │  - SSO Flow     │
│    Validation   │    │  - User Info    │    │  - User Info    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

##  Features

###  Implemented Features
- **Centralized Authentication**: Single auth server handles all authentication
- **JWT-based Tokens**: Secure, stateless authentication using JSON Web Tokens
- **Cross-domain Cookie Sharing**: Cookies shared across `.localhost` domain
- **Automatic Redirects**: Apps redirect to auth server when not authenticated
- **Session Management**: Active session tracking with logout functionality
- **JSON API Responses**: Clean, structured JSON responses for all endpoints

###  Security Features
- **HttpOnly Cookies**: Prevents XSS attacks
- **Secure Cookies**: HTTPS-only in production
- **Session Validation**: Server-side session tracking
- **Token Expiration**: Automatic token expiry (1 hour)
- **CSRF Protection**: SameSite cookie attribute
- **Input Validation**: Basic request validation

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd sso-poc

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
# (Optional - defaults are provided)

# Start all services
npm run dev
```

### Manual Start
```bash
# Terminal 1 - Auth Server
npm run start

# Terminal 2 - App A
npm run start:app-a

# Terminal 3 - App B
npm run start:app-b
```

##  Usage

### 1. Access Applications
- **Auth Server**: http://localhost:3000
- **App A**: http://localhost:3001
- **App B**: http://localhost:3002

### 2. Login Process
1. Visit any application (App A or App B)
2. You'll be redirected to the auth server
3. Use demo credentials:
   - **Username**: `admin`
   - **Password**: `password`
4. After successful login, you'll be redirected back to the original application

### 3. SSO Experience
- Once logged in, you can navigate between App A and App B without re-authentication
- User information is shared across all applications
- Logout from any app will log you out from all apps

## Project Structure

```
sso-poc/
├── auth_server.js      # Central authentication server
├── app_a.js           # First application (Port 3001)
├── app_b.js           # Second application (Port 3002)
├── package.json       # Dependencies and scripts
├── package-lock.json  # Locked dependencies
├── env.example        # Environment variables template
├── .env               # Environment variables (create from env.example)
└── README.md          # This file
```

##  Configuration

### Environment Variables (.env file)
```bash
# SSO Configuration
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server URLs
AUTH_SERVER_URL=http://localhost:3000

# Port Configuration
PORT=3000
APP_A_PORT=3001
APP_B_PORT=3002

# Cookie Configuration
COOKIE_DOMAIN=.localhost
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax

# Session Configuration
SESSION_TIMEOUT=3600000
TOKEN_EXPIRY=1h
```

##  API Endpoints

### Auth Server (Port 3000)
- `POST /login` - Login endpoint
  ```json
  {
    "username": "admin",
    "password": "password"
  }
  ```
- `POST /logout` - Logout endpoint
- `GET /validate` - Token validation
- `GET /health` - Health check

### App A (Port 3001)
- `GET /` - Protected home page
  ```json
  {
    "message": "Welcome to App A",
    "user": {
      "username": "admin",
      "sessionId": "abc123...",
      "loggedInAt": "2024-01-01T12:00:00.000Z"
    },
    "app": "App A",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```
- `GET /api/user` - User information API
- `GET /health` - Health check

### App B (Port 3002)
- `GET /` - Protected home page
  ```json
  {
    "message": "Welcome to App B",
    "user": {
      "username": "admin",
      "sessionId": "abc123...",
      "loggedInAt": "2024-01-01T12:00:00.000Z"
    },
    "app": "App B",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```
- `GET /api/user` - User information API
- `GET /health` - Health check

##  Testing the SSO Flow

### Using curl
```bash
# 1. Login to get a session
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  -c cookies.txt

# 2. Access App A (will use the session cookie)
curl -b cookies.txt http://localhost:3001/

# 3. Access App B (will use the same session cookie)
curl -b cookies.txt http://localhost:3002/

# 4. Logout
curl -X POST http://localhost:3000/logout -b cookies.txt
```

### Using Browser
1. **Start all services**: `npm run dev`
2. **Visit App A**: http://localhost:3001
3. **You'll be redirected to login**: http://localhost:3000/login
4. **Login with demo credentials**: admin/password
5. **You'll be redirected back to App A**
6. **Navigate to App B**: http://localhost:3002
7. **You should be automatically logged in**
8. **Test logout**: Use the logout endpoint

