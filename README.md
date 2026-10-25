<h1 align="center">Shortly - URL Shortener, Analytics & Resilient QR Codes</h1>

<p align="center">
  A high-performance, full-stack URL shortening service, click analytics platform, and dynamic QR code suite built with <strong>React 19</strong>, <strong>Express 5</strong>, <strong>React Router 7</strong>, and <strong>MongoDB</strong>. Features collision-resistant link generation, atomic visit tracking, resilient print-safe QR codes with editable destinations, robust JWT cookie authentication with token blacklisting.
</p>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://reactrouter.com/"><img src="https://img.shields.io/badge/React_Router-7.18.4-CA4245?style=flat-square&logo=react-router&logoColor=white" alt="React Router 7" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-5.2.1-000000?style=flat-square&logo=express&logoColor=white" alt="Express 5" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 18+" /></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <a href="https://www.passportjs.org/"><img src="https://img.shields.io/badge/Passport.js-Google_OAuth_2.0-34A853?style=flat-square&logo=google&logoColor=white" alt="Passport Google OAuth 2.0" /></a>
  <a href="https://www.npmjs.com/package/qrcode"><img src="https://img.shields.io/badge/QRCode-1.5.4-blue?style=flat-square&logo=qr-code&logoColor=white" alt="QRCode" /></a>
  <a href="https://jwt.io/"><img src="https://img.shields.io/badge/JWT-Secure%20Cookies-000000?style=flat-square&logo=json-web-tokens&logoColor=white" alt="JWT" /></a>
  <a href="https://prettier.io"><img src="https://img.shields.io/badge/Code%20Style-Prettier-ff69b4.svg?style=flat-square" alt="Prettier" /></a>
</p>

<p align="center">
  <img src="https://ik.imagekit.io/cuq3fe9wm/sheryians-backend/Screenshot%202026-10-25%20150705.png" alt="Shortly Dashboard & Home Page Preview" width="100%" />
</p>

---

## Table of Contents

- [Overview & Vision](#-overview--vision)
- [Key Features](#-key-features)
    - [1. Collision-Resistant URL Shortening & Instant Redirection](#1-collision-resistant-url-shortening--instant-redirection)
    - [2. Resilient Dynamic QR Codes (Print-Safe Architecture)](#2-resilient-dynamic-qr-codes-print-safe-architecture)
    - [3. Real-Time Click Analytics & Performance Metrics](#3-real-time-click-analytics--performance-metrics)
    - [4. Enterprise Authentication & Stateful Revocation](#4-enterprise-authentication--stateful-revocation)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [1. Environment Setup](#1-environment-setup)
    - [2. Concurrent Development Mode](#2-concurrent-development-mode-recommended)
    - [3. Unified Production Build](#3-unified-production-build)
- [API Reference](#-api-reference)
    - [Authentication Endpoints (`/api/auth`)](#authentication-endpoints-apiauth)
    - [URL Management Endpoints (`/api/url`)](#url-management-endpoints-apiurl)
    - [QR Code Endpoints (`/api/qr`)](#qr-code-endpoints-apiqr)
    - [Public Redirection (`/:shortCode`)](#public-redirection-shortcode)
- [Security & Traffic Governance](#-security--traffic-governance)
- [Helpful Scripts](#-helpful-scripts)
- [License](#-license)

---

## Overview & Vision

Long, cluttered URLs are fragile, look unprofessional in communication, and hide vital engagement metrics. When printed on physical marketing materials — such as flyers, product packaging, posters, or business cards — changing a link destination normally requires costly reprints.

**Shortly** solves this comprehensively by combining:

1. **Lightweight URL Shortening**: Converts cumbersome links into compact, 6-character collision-resistant slugs.
2. **Resilient Dynamic QR Codes**: Generates high-resolution vector/raster QR codes pointing to dynamic short URLs. If the destination URL or business domain changes later, you can update the target anytime without invalidating the physical QR codes already printed.
3. **Granular Engagement Metrics**: Real-time atomic visit tracking, top-performing asset metrics, and historical destination updates.
4. **Stateful Session Protection**: Complete user authentication featuring HTTP-only JWT cookies, server-side token blacklisting on logout, and multi-tier rate limiting.

---

## Key Features

### 1. Collision-Resistant URL Shortening & Instant Redirection

- **Base62 Collision-Resistant Slugs**: Generates random 6-character alphanumeric identifiers (`[a-zA-Z0-9]`), yielding **56.8+ billion** possible combinations with an automated retry loop.
- **Atomic Click Tracking**: High-throughput `$inc` updates in MongoDB prevent concurrency race conditions under high traffic.
- **Dual Redirection Architecture**:
    - `http://localhost:3000/:shortCode` — Public, root-level redirection for sharing links with end users.
    - `http://localhost:3000/api/url/redirect/:shortCode` — API-namespaced redirection for programmatic services.
- **Browser Prefetch Guard**: Intercepts `favicon.ico` browser requests with `204 No Content`, keeping visit counts accurate.

### 2. Resilient Dynamic QR Codes (Print-Safe Architecture)

- **Permanent Print Reliability**: Physical QR codes encode the immutable short URL (`/:shortCode?ref=qr`). The underlying destination URL can be updated at any time via `PATCH /api/url/:id`.
- **Target Destination Editing**: Change destination links effortlessly without altering the short code, avoiding broken physical QR assets.
- **Audit Trail & Version History**: Every destination update records the `previousUrl` and `changedAt` timestamp inside an `editHistory` array on MongoDB.
- **Instant Preview & Download**: Live in-browser QR generation with options to inspect, download as high-resolution PNG, or copy short links directly.

### 3. Real-Time Click Analytics & Performance Metrics

- **Atomic Visit Increments**: High-throughput `$inc` updates in MongoDB prevent concurrency race conditions under heavy traffic.
- **Aggregated Performance Cards**: Dashboard displays live metrics including total shortened links, active dynamic QR codes, cumulative visits, resilient destination updates, and top-performing assets.
- **Live Search & Filter**: Instant client-side and server-side link filtering by original URL or short slug, protected against RegExp injection attacks.
- **Flexible Identifiers**: Endpoints accept either a 24-character MongoDB `ObjectId` or the 6-character `shortUrl` slug interchangeably.
- **Future Camera Scanning & Telemetry**: Backend infrastructure already supports scan differentiation via `?ref=qr`; native in-browser camera scanning and dedicated QR telemetry are slated for upcoming releases (see [docs/FUTURE_SCOPE.md](docs/FUTURE_SCOPE.md)).

### 4. Authentication, Google OAuth 2.0 & Stateful Revocation

- **Dual Authentication Channels**: Supports standard email/password registration & login as well as one-click **Google OAuth 2.0** social sign-in.
- **Smart Account Linking**: Automatically reconciles existing email accounts when a user signs in with Google, maintaining unified user records without duplicate profiles.
- **Secure Cookie Sessions**: JSON Web Tokens (JWT) are signed and stored in HTTP-only, SameSite-protected cookies (`httpOnly: true`, `sameSite`, `secure: isProduction`).
- **Server-Side Token Revocation**: Logging out does not just clear client cookies; it persists the active token to a MongoDB `blacklistTokens` collection to invalidate it immediately across the server.
- **Interactive Account Management**: Top navigation features an account dropdown with dynamic Google avatar rendering and an **Account Profile Modal** displaying active session telemetry, sign-in provider method, and one-click logout.
- **Route Guards**: Built-in React Router guards (`ProtectedRoute`, `PublicOnlyRoute`, and dedicated `/auth/callback` routing) manage navigation states cleanly.

### 5. Multi-User Isolation & Reactive State Synchronization

- **Strict User Scoping**: Every link and QR code is bound to the creator's account (`user: ObjectId`). Read, update, and deletion operations enforce strict ownership checks.
- **Reactive Frontend Lifecycle**: `UrlContext` and `QrContext` subscribe to `useAuth()`. Signing in (local or Google OAuth) reactively queries user-specific links, while signing out immediately wipes local link memory, preventing cross-account state leakage.

---

## System Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      Client (React 19 + Vite)                          │
 │                                                                        │
 │  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────┐ │
 │  │ AuthProvider (Context)│  │ UrlProvider (Context) │  │ QrProvider  │ │
 │  │ - user, login, logout │  │ - user-scoped urls    │  │ - user qrUrls│ │
 │  └───────────┬───────────┘  └───────────┬───────────┘  └──────┬──────┘ │
 │              │                          │                     │        │
 │              ▼                          ▼                     ▼        │
 │  ┌──────────────────────────────────────────────────────────────────┐  │
 │  │ MainDashboard (Segmented Switcher [URL | QR], Hero Banner)       │  │
 │  │ React Router 7 (/, /qr -> /?tab=qr, /login, /register, Guards)   │  │
 │  │ Axios Client (withCredentials: true, baseURL: /api/*)            │  │
 │  └──────────────────────────────────┬───────────────────────────────┘  │
 └─────────────────────────────────────┼──────────────────────────────────┘
                                       │
                     ┌─────────────────┴────────────────────────┐
                     │ HTTP API Requests (JSON + Cookies)       │ Direct Browser & QR Visits
                     ▼                                          ▼
 ┌──────────────────────────────────────────────────────┐  ┌─────────────────────────────────────┐
 │               Express 5 API Pipeline                 │  │       Public Short URL Route        │
 │                                                      │  │      GET /:shortCode[?ref=qr]       │
 │  1. express.json(), cookieParser(), morgan           │  └──────────────────┬──────────────────┘
 │  2. Global Rate Limiter (200 req / 15 min)           │                     │
 │  3. Modular Routers:                                 │                     │
 │     ├── /api/auth Router (register, login, logout)   │                     │
 │     ├── /api/url Router                              │                     │
 │     │   ├── shortenUrl() middleware (user-scoped)    │                     │
 │     │   ├── GET, POST, DELETE, and PATCH /:id        │                     │
 │     └── /api/qr Router                               │                     │
 │         ├── shortenUrl({ qrGenerated: true })        │                     │
 │         └── QRCode.toDataURL() generator             │                     │
 └──────────────────────┬───────────────────────────────┘                     │
                        │                                                     │
                        ▼                                                     │
 ┌────────────────────────────────────────────────────────────────────────┐   │
 │                     Mongoose 9 / MongoDB Layer                         │◄──┘
 │                                                                        │
 │   - users Collection: Password hashing (bcrypt) & Google OAuth IDs     │
 │   - blacklistTokens Collection: Revoked tokens on logout               │
 │   - urls Collection:                                                   │
 │       • user (ObjectId reference to users, indexed)                    │
 │       • shortUrl (unique indexed slug)                                 │
 │       • clicks (atomic $inc counters)                                  │
 │       • qrGenerated (boolean indicator)                                │
 │       • qrScans (prepared for camera scan tracking; see future scope)  │
 │       • editHistory [{ previousUrl, changedAt }]                       │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology           | Version   | Purpose                                                                      |
| :------------------- | :-------- | :--------------------------------------------------------------------------- |
| **React**            | `19.1.0`  | Modern component architecture utilizing declarative state and custom hooks   |
| **React Router DOM** | `7.18.4`  | Client-side routing, protected navigation guards, and SPA history            |
| **Vite**             | `6.3.5`   | Lightning-fast development server with HMR and optimized production bundling |
| **Axios**            | `1.20.0`  | HTTP client with automatic cookie handling (`withCredentials: true`)         |
| **QRCode**           | `1.5.4`   | Client-side and in-browser QR code rendering and data generation             |
| **Lucide React**     | `1.49.0`  | Accessible, unified iconography across all components                        |
| **Sass (SCSS)**      | `1.105.1` | Modular CSS architecture with design tokens, mixins, and theme variables     |

### Backend

| Technology             | Version  | Purpose                                                            |
| :--------------------- | :------- | :----------------------------------------------------------------- |
| **Node.js**            | `v18+`   | Native ES Modules JavaScript runtime (`"type": "module"`)          |
| **Express**            | `5.2.1`  | Web framework with native Promise/async error handling             |
| **MongoDB & Mongoose** | `9.10.2` | Document database with schema validation and unique indexes        |
| **QRCode**             | `1.5.4`  | Server-side generation of high-resolution QR data URLs             |
| **JSONWebToken**       | `9.0.3`  | Cryptographic JWT token generation and verification                |
| **Bcrypt**             | `6.0.0`  | Secure one-way password hashing (10 salt rounds)                   |
| **Cookie-Parser**      | `1.4.7`  | Middleware to parse and read HTTP cookies                          |
| **Passport.js**        | `0.7.0`  | Authentication middleware with `passport-google-oauth20` strategy |
| **Express Rate Limit** | `8.7.0`  | Tiered protection against brute-force and denial-of-service        |
| **Express Validator**  | `7.3.2`  | Request body and parameter validation with standardized 422 errors |
| **Morgan**             | `1.12.1` | Standard Apache-format HTTP request logger                         |

---

## Project Directory Structure

```text
url-shortner/
├── client/                                # React 19 Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/                # Global UI components
│   │   │   │   ├── AccountModal/          # Profile modal with session telemetry & logout
│   │   │   │   ├── Navbar/                # Top navbar with user dropdown & branding
│   │   │   │   ├── Footer/                # Informative footer with repo links & tech stack
│   │   │   │   └── Toast/                 # Feedback toast alerts
│   │   │   ├── features/
│   │   │   │   ├── auth/                  # Authentication Module
│   │   │   │   │   ├── components/        # LoginForm, RegisterForm
│   │   │   │   │   ├── context/           # AuthContext (user, login, logout, checkAuth)
│   │   │   │   │   ├── hooks/             # useAuth hook
│   │   │   │   │   ├── pages/             # LoginPage, RegisterPage, OAuthCallbackPage
│   │   │   │   │   └── services/          # auth.api.js (Axios endpoints)
│   │   │   │   ├── qr/                    # Dynamic Resilient QR Module
│   │   │   │   │   ├── components/        # QrForm, QrResult, QrStats, QrList, QrModal, EditUrlModal
│   │   │   │   │   ├── context/           # QrContext (QR generation, updates, list sync)
│   │   │   │   │   ├── hooks/             # useQr hook
│   │   │   │   │   ├── pages/             # QrPage (QR dashboard)
│   │   │   │   │   └── services/          # qr.api.js (Axios QR endpoints)
│   │   │   │   └── url/                   # Link Management Module
│   │   │   │       ├── components/        # UrlCard, UrlForm, UrlList, UrlResult, UrlStats
│   │   │   │       ├── context/           # UrlContext (URLs state, creation, deletion)
│   │   │   │       ├── hooks/             # useUrls, useClipboard
│   │   │   │       └── services/          # url.api.js (Axios URL endpoints)
│   │   │   └── pages/
│   │   │       └── MainDashboard/         # Unified Kraken-inspired dashboard with tab switcher
│   │   ├── styles/                        # Modular SCSS design tokens, reset, and mixins
│   │   ├── app.routes.jsx                 # ProtectedRoute, PublicOnlyRoute & Route tree
│   │   ├── App.jsx                        # Root application component with Providers
│   │   └── main.jsx                       # React DOM entrypoint
│   ├── index.html                         # HTML template
│   ├── vite.config.js                     # Vite configuration with /api reverse proxy
│   └── package.json
│
├── server/                                # Express 5 Backend Service
│   ├── scripts/
│   │   └── build-client.js                # Build script bundling client into server/src/public
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                      # MongoDB connection & reconnect handlers
│   │   │   ├── env.config.js              # Strict environment variable assertions
│   │   │   └── passport.config.js         # Passport Google OAuth 2.0 strategy configuration
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js         # JWT cookie validation & blacklist check
│   │   │   ├── rateLimit.middleware.js    # Global, creation, and redirect rate limiters
│   │   │   ├── shortenUrl.middleware.js   # Reusable pipeline: code generation & URL storage
│   │   │   └── validate.middleware.js     # express-validator schemas & 422 formatters
│   │   ├── models/
│   │   │   ├── blacklist.model.js         # Logged-out revoked tokens
│   │   │   ├── url.model.js               # Shortened link records, QR flags, scan metrics
│   │   │   └── user.model.js              # User account credentials & OAuth provider data
│   │   ├── modules/
│   │   │   ├── auth/                      # Auth controllers & routes (/api/auth & /auth)
│   │   │   │   ├── controllers/           # auth.controller.js, google.controller.js
│   │   │   │   └── routes/                # auth.route.js
│   │   │   ├── qr/                        # QR controllers & routes (/api/qr)
│   │   │   └── url/                       # URL controllers & routes (/api/url)
│   │   ├── utils/
│   │   │   └── generateCode.js            # Cryptographically safe 6-char slug generator
│   │   └── app.js                         # Express configuration, static files & SPA fallback
│   ├── .env                               # Server environment variables (git-ignored)
│   ├── server.js                          # Database bootstrap & HTTP server entrypoint
│   └── package.json
│
├── docs/                                  # Project documentation & design specs
│   ├── DESIGN-kraken.md                   # Kraken-inspired design system documentation
│   ├── FUTURE_SCOPE.md                    # Roadmap: In-browser camera QR scanner & scan telemetry
│   └── qrplan.md                          # Dynamic QR implementation blueprints
├── .prettierrc                            # Unified code formatting configuration
├── .prettierignore                        # Prettier ignore patterns
├── package.json                           # Root scripts for repository formatting
└── README.md                              # Main documentation (you are here)
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (`v20+` recommended)
- **npm**: `v9.0.0` or higher
- **MongoDB**: A running local instance (`mongodb://localhost:27017/shortly`) or a cloud [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string.

---

### 1. Environment Setup

Create a `.env` file inside the `server/` directory:

```env
# server/.env

# MongoDB connection URI (Required)
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/url-shortener?retryWrites=true&w=majority

# Secret key used for signing JWT cookies (Required)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Port for Express server (Optional, default: 3000)
SERVER_PORT=3000

# Server base URL for building full links (Optional, default: http://localhost:3000)
SERVER_URL=http://localhost:3000

# Google OAuth 2.0 Credentials (Optional, disables Google Sign-In if empty)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Client URL (post-OAuth redirect target)
CLIENT_URL=http://localhost:5173

# Environment mode
NODE_ENV=development
```

> [!IMPORTANT]
> The server validates `DATABASE_URL` and `JWT_SECRET` at boot time and will refuse to start if either is missing.

---

### 2. Concurrent Development Mode (Recommended)

In development, the Vite dev server runs on port `5173` and proxies `/api` requests to the Express server on port `3000`.

1. **Start the backend server**:

    ```bash
    cd server
    npm install
    npm run dev
    ```

    _The server runs at `http://localhost:3000` with hot-reload via nodemon._

2. **Start the frontend client** (in a separate terminal):

    ```bash
    cd client
    npm install
    npm run dev
    ```

    _Open `http://localhost:5173` in your browser to access the app with instant HMR._

---

### 3. Unified Production Build

You can compile the client directly into `server/src/public` and serve the entire application from a single Node.js process:

```bash
cd server
npm run build
npm start
```

1. `npm run build` runs `scripts/build-client.js`, compiling the React frontend into static assets located in `server/src/public`, and performs a syntax check on `server.js`.
2. `npm start` launches Express, which serves the REST API, short link redirects, and the React Single Page Application (SPA) on `http://localhost:3000`.

---

## API Reference

Base URL: `http://localhost:3000`

### Authentication Endpoints (`/api/auth` & `/auth`)

| Method | Endpoint               | Access    | Description                                             |
| :----- | :--------------------- | :-------- | :------------------------------------------------------ |
| `POST` | `/api/auth/register`   | Public    | Create a new user account with email & password         |
| `POST` | `/api/auth/login`      | Public    | Authenticate user with password & receive HTTP cookie   |
| `GET`  | `/auth/google`         | Public    | Initiate Google OAuth 2.0 social sign-in flow           |
| `GET`  | `/auth/google/callback`| Public    | Google OAuth redirect callback (issues JWT cookie)      |
| `POST` | `/api/auth/logout`     | Public    | Revoke session, blacklist token & clear secure cookie   |
| `GET`  | `/api/auth/me`         | Protected | Fetch current authenticated user profile & provider info|

#### Register User

`POST /api/auth/register`

```json
{
    "username": "user",
    "email": "user@example.com",
    "password": "Password123"
}
```

_Response (`201 Created`):_

```json
{
    "message": "user registration successfull",
    "data": {
        "username": "user",
        "email": "user@example.com"
    }
}
```

#### Login User

`POST /api/auth/login`

```json
{
    "email": "user@example.com",
    "password": "Password123"
}
```

_Response (`200 OK` - Sets secure `token` cookie):_

```json
{
    "message": "Login successfull",
    "data": {
        "username": "user",
        "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> [!NOTE]
> Accounts created exclusively via Google OAuth without a password will return `400 Bad Request` directing the user to use the "Sign in with Google" button.

#### Google OAuth 2.0 Authentication

- **Initiate Flow**: `GET /auth/google` (or `/api/auth/google`)  
  Redirects the user to Google's consent screen.
- **Callback**: `GET /auth/google/callback` (or `/api/auth/google/callback`)  
  Receives authorization code, provisions or links the user account in MongoDB, sets the secure HTTP-only JWT cookie, and redirects to `${CLIENT_URL}/auth/callback?success=true`.

#### Verify Current Session

`GET /api/auth/me`

_Response (`200 OK`):_

```json
{
    "message": "user fetched successfully",
    "data": {
        "username": "user",
        "email": "user@example.com",
        "authProvider": "google",
        "profilePicture": "https://lh3.googleusercontent.com/a/..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout

`POST /api/auth/logout`

_Response (`200 OK` - Blacklists token and clears cookie):_

```json
{
    "message": "logged out successfully"
}
```

---

### URL Management Endpoints (`/api/url`)

All `/api/url` endpoints require an authenticated session cookie and are strictly scoped to the authenticated user.

| Method   | Endpoint                       | Rate Limit       | Description                                                 |
| :------- | :----------------------------- | :--------------- | :---------------------------------------------------------- |
| `POST`   | `/api/url`                     | 10 req / min     | Shorten a target URL bound to the authenticated user        |
| `GET`    | `/api/url`                     | 200 req / 15 min | List authenticated user's links (supports `?search=` query) |
| `GET`    | `/api/url/:id`                 | 200 req / 15 min | Get user's link details by Mongo `_id` or `shortUrl`        |
| `PATCH`  | `/api/url/:id`                 | 200 req / 15 min | Update destination URL & append to `editHistory` (owner)    |
| `DELETE` | `/api/url/:id`                 | 200 req / 15 min | Delete link by Mongo `_id` or 6-char `shortUrl` (owner)     |
| `GET`    | `/api/url/redirect/:shortCode` | 60 req / min     | API-level redirection with atomic click count               |

#### Shorten a URL

`POST /api/url`

```json
{
    "url": "https://react.dev/reference/react/useActionState"
}
```

_Response (`201 Created`):_

```json
{
    "message": "shorten url created successfully",
    "data": {
        "id": "6724a1f3c5d8a9e71b2f4a12",
        "originalUrl": "https://react.dev/reference/react/useActionState",
        "shortUrl": "u8K2z9",
        "fullShortUrl": "http://localhost:3000/u8K2z9",
        "clicks": 0,
        "createdAt": "2026-10-15T06:30:00.000Z"
    }
}
```

#### Update Destination URL (Resilient QR)

`PATCH /api/url/:id`

Updates the destination URL without altering the short code, preserving all physical printed QR codes.

```json
{
    "url": "https://react.dev/reference/react/useOptimistic"
}
```

_Response (`200 OK`):_

```json
{
    "message": "Destination URL updated successfully",
    "data": {
        "id": "6724a1f3c5d8a9e71b2f4a12",
        "originalUrl": "https://react.dev/reference/react/useOptimistic",
        "shortUrl": "u8K2z9",
        "fullShortUrl": "http://localhost:3000/u8K2z9",
        "clicks": 14,
        "qrScans": 8,
        "editHistory": [
            {
                "previousUrl": "https://react.dev/reference/react/useActionState",
                "changedAt": "2026-10-20T21:40:00.000Z"
            }
        ],
        "updatedAt": "2026-10-20T21:40:00.000Z"
    }
}
```

---

### QR Code Endpoints (`/api/qr`)

Dedicated endpoints for generating and managing print-safe dynamic QR codes, scoped to the authenticated user.

| Method | Endpoint  | Rate Limit       | Description                                                                     |
| :----- | :-------- | :--------------- | :------------------------------------------------------------------------------ |
| `POST` | `/api/qr` | 10 req / min     | Shortens URL bound to user, marks `qrGenerated: true`, and returns QR image data|
| `GET`  | `/api/qr` | 200 req / 15 min | Retrieves authenticated user's URLs created via the QR flow                     |

#### Generate Dynamic QR Code

`POST /api/qr`

```json
{
    "url": "https://company.org/spring-campaign"
}
```

_Response (`201 Created`):_

```json
{
    "message": "QR code created successfully",
    "data": {
        "id": "6724b9a1c5d8a9e71b2f4b45",
        "originalUrl": "https://company.org/spring-campaign",
        "shortUrl": "7mK9p2",
        "fullShortUrl": "http://localhost:3000/7mK9p2",
        "qrTargetUrl": "http://localhost:3000/7mK9p2?ref=qr",
        "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "qrGenerated": true,
        "clicks": 0,
        "qrScans": 0,
        "createdAt": "2026-10-20T21:50:00.000Z"
    }
}
```

#### List All QR Code URLs

`GET /api/qr`

_Response (`200 OK`):_

```json
{
    "message": "QR URLs fetched successfully",
    "data": {
        "urls": [
            {
                "_id": "6724b9a1c5d8a9e71b2f4b45",
                "originalUrl": "https://company.org/spring-campaign",
                "shortUrl": "7mK9p2",
                "clicks": 42,
                "qrGenerated": true,
                "qrScans": 37,
                "editHistory": [],
                "createdAt": "2026-10-20T21:50:00.000Z",
                "updatedAt": "2026-10-20T21:50:00.000Z"
            }
        ]
    }
}
```

---

### Public Redirection (`/:shortCode`)

```http
GET http://localhost:3000/:shortCode
GET http://localhost:3000/:shortCode?ref=qr
```

- **Access**: Public (no login required for end users clicking links or scanning codes).
- **Behavior**:
    - Increments the `clicks` counter atomically in MongoDB via `$inc`.
    - When `?ref=qr` is present, also atomically increments `qrScans: 1` (foundation for upcoming camera QR scan telemetry; see [Future Scope](docs/FUTURE_SCOPE.md)).
    - Responds with **HTTP 302 Found** redirecting to the current `originalUrl`.
    - Automatically responds with **204 No Content** if the browser requests `/favicon.ico`.
    - Returns **404 Not Found** if the short code does not exist.

---

## Security & Traffic Governance

1. **Password Encryption**: Passwords are salted and hashed using `bcrypt` (10 rounds). Plaintext passwords are never logged or stored.
2. **Stateless Token with Stateful Revocation**: JWTs are signed with a server secret (`7d` expiration). To prevent stolen or reused tokens after logout, the token is saved into a `blacklistTokens` collection and rejected on subsequent calls.
3. **Multi-Tier Rate Limiting**:

- `globalLimiter`: 200 requests / 15 minutes across all routes.
- `createUrlLimiter`: 10 requests / 1 minute per IP on `POST /api/url` and `POST /api/qr`.
- `redirectLimiter`: 60 requests / 1 minute per IP on redirection endpoints.

4. **Input Validation**: `express-validator` rejects non-HTTP(S) URLs, oversized inputs (> 2048 characters), and invalid parameter formats with structured `422 Unprocessable Entity` payloads.
5. **Regex Sanitization**: Link search queries are cleansed of special regex control characters prior to building queries, mitigating ReDoS vulnerabilities.
6. **Immutable Print Guarantee**: Updating a URL's destination preserves the short code, guaranteeing that printed assets remain functional indefinitely.

---

## Helpful Scripts

### Root Directory

- `npm run format`: Runs Prettier across all `.js`, `.jsx`, `.scss`, and `.md` files.
- `npm run format:check`: Validates formatting consistency.

### Client Directory (`cd client`)

- `npm run dev`: Launches Vite development server on port 5173 with proxy to backend.
- `npm run build`: Bundles the client for distribution.
- `npm run lint`: Checks for React and JavaScript syntax warnings with ESLint.

### Server Directory (`cd server`)

- `npm run dev`: Runs the API with live reload via `nodemon`.
- `npm run build`: Automatically compiles the client and bundles it directly into `server/src/public` with syntax verification.
- `npm start`: Starts the production Express server serving API + static assets.

---

## License

This project is licensed under the ISC License. Feel free to use, modify, and distribute it for personal and commercial projects.
