<h1 align="center">Shortly - URL Shortener & Analytics</h1>

<p align="center">
  A high-performance, full-stack URL shortening service and click analytics platform built with <strong>React 19</strong>, <strong>Express 5</strong>, <strong>React Router 7</strong>, and <strong>MongoDB</strong>. Features collision-resistant link generation, atomic visit tracking, robust JWT cookie authentication with token blacklisting, and a sleek monochromatic design system.
</p>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://reactrouter.com/"><img src="https://img.shields.io/badge/React_Router-7.18.4-CA4245?style=flat-square&logo=react-router&logoColor=white" alt="React Router 7" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-5.2.1-000000?style=flat-square&logo=express&logoColor=white" alt="Express 5" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 18+" /></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <a href="https://jwt.io/"><img src="https://img.shields.io/badge/JWT-Secure%20Cookies-000000?style=flat-square&logo=json-web-tokens&logoColor=white" alt="JWT" /></a>
  <a href="https://prettier.io"><img src="https://img.shields.io/badge/Code%20Style-Prettier-ff69b4.svg?style=flat-square" alt="Prettier" /></a>
</p>

---

## Table of Contents

- [Overview & Vision](#-overview--vision)
- [Key Features](#-key-features)
    - [Authentication & Security](#1-authentication--session-security)
    - [URL Shortening & Redirection](#2-url-shortening--instant-redirection)
    - [Analytics & Search](#3-real-time-analytics--smart-filtering)
    - [User Interface & Experience](#4-modern-monochrome-ui--ux)
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
    - [Public Redirection (`/:shortCode`)](#public-redirection-shortcode)
- [Security & Traffic Governance](#-security--traffic-governance)
- [Helpful Scripts](#-helpful-scripts)
- [License](#-license)

---

## Overview & Vision

Long, cluttered URLs are fragile, look unprofessional in messages or posts, and hide engagement data. **Shortly** solves this by providing a clean, end-to-end link management platform that turns unwieldy links into compact, 6-character slugs with real-time click metrics.

Unlike simple throwaway shorteners, Shortly features a **complete user authentication system** with protected dashboards, secure cookie-based JWT sessions, server-side token revocation on logout, rate-limiting protections, and a unified production pipeline where the client and server can be served from a single port.

---

## Key Features

### 1. Authentication & Session Security

- **Full Auth Flow**: Clean registration, login, profile verification (`/api/auth/me`), and sign-out flows.
- **Secure Cookie Sessions**: JSON Web Tokens (JWT) are transferred and validated via cookies with `withCredentials: true` in Axios.
- **Server-Side Token Revocation**: Logging out doesn't just clear client cookies; it persists the token to a MongoDB `blacklistTokens` collection to prevent replay attacks.
- **Route Guards**: Built-in React Router guards (`ProtectedRoute` and `PublicOnlyRoute`) to manage authenticated views and redirect unauthenticated guests gracefully.

### 2. URL Shortening & Instant Redirection

- **Base62 Collision-Resistant Slugs**: Generates random 6-character alphanumeric identifiers (`[a-zA-Z0-9]`), yielding **56.8+ billion** possible combinations with a safe collision-retry loop.
- **Atomic Click Tracking**: High-throughput `$inc` updates in MongoDB prevent concurrency race conditions under heavy traffic.
- **Dual Redirection Architecture**:
    - `http://localhost:3000/:shortCode` — Public, root-level redirection for sharing links with end users.
    - `http://localhost:3000/api/url/redirect/:shortCode` — API-namespaced redirection for programmatic services.
- **Browser Prefetch Guard**: Intercepts `favicon.ico` browser requests with `204 No Content`, keeping visit counts accurate.

### 3. Real-Time Analytics & Smart Filtering

- **Live Search & Filter**: Instant client-side and server-side link filtering by original URL or short slug, protected against RegExp injection attacks.
- **Aggregated Metrics**: Dashboard cards display total links created, total visits across all links, and average click-through rates.
- **Flexible Lookups**: Endpoints accept either a 24-character MongoDB `ObjectId` or the 6-character `shortUrl` slug interchangeably without casting errors.

### 4. Modern Monochrome UI / UX

- **Design System**: Tailored black-and-white minimalist theme built with pure SCSS tokens, typography pairings, and subtle border highlights.
- **Theme Switcher**: Fluid Dark and Light mode toggle with persistent state saved in `localStorage`.
- **Feedback & Feedback Loops**: Instant clipboard copying with visual confirmation, interactive action states, and global auto-dismissing toast notifications.

---

## System Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      Client (React 19 + Vite)                          │
 │                                                                        │
 │  ┌───────────────────────┐             ┌────────────────────────────┐  │
 │  │ AuthProvider (Context)│             │   UrlProvider (Context)    │  │
 │  │ - user, login, logout │             │ - urls, stats, filter, ops │  │
 │  └───────────┬───────────┘             └─────────────┬──────────────┘  │
 │              │                                       │                 │
 │              ▼                                       ▼                 │
 │  ┌───────────────────────┐             ┌────────────────────────────┐  │
 │  │ React Router 7 Routes │             │ Axios Services (Cookies)   │  │
 │  │ Protected & Public    │             │ baseURL: /api/*            │  │
 │  └───────────────────────┘             └─────────────┬──────────────┘  │
 └──────────────────────────────────────────────────────┼─────────────────┘
                                                        │
                      ┌─────────────────────────────────┴────────────────────────┐
                      │ HTTP Requests (JSON + Cookies)                           │ Direct Browser Navigation
                      ▼                                                          ▼
 ┌──────────────────────────────────────────────────────┐        ┌───────────────────────────────┐
 │               Express 5 API Pipeline                 │        │      Root Short URL Route     │
 │                                                      │        │       GET /:shortCode         │
 │  1. express.json(), cookieParser(), morgan           │        └───────────────┬───────────────┘
 │  2. Global Rate Limiter (200 req / 15 min)           │                        │
 │  3. Modular Routers:                                 │                        │
 │     ├── /api/auth Router (register, login, logout)   │                        │
 │     └── /api/url Router                              │                        │
 │         ├── authUser Middleware (Cookie + Blacklist) │                        │
 │         ├── Route Rate Limiters (10 req/min)         │                        │
 │         └── express-validator Sanitization           │                        │
 └──────────────────────┬───────────────────────────────┘                        │
                        │                                                        │
                        ▼                                                        │
 ┌────────────────────────────────────────────────────────────────────────┐      │
 │                     Mongoose 9 / MongoDB Layer                         │◄─────┘
 │                                                                        │
 │   - users Collection: Password hashing (bcrypt)                        │
 │   - blacklistTokens Collection: Revoked tokens on logout               │
 │   - urls Collection: Indexed shortUrl, atomic $inc click counters      │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology           | Version   | Purpose                                                                      |
| :------------------- | :-------- | :--------------------------------------------------------------------------- |
| **React**            | `19.1.0`  | Modern component library utilizing declarative state and custom hooks        |
| **React Router DOM** | `7.18.4`  | Client-side routing, protected navigation guards, and SPA history            |
| **Vite**             | `6.3.5`   | Lightning-fast development server with HMR and optimized production bundling |
| **Axios**            | `1.20.0`  | HTTP client with automatic cookie handling (`withCredentials: true`)         |
| **Lucide React**     | `1.49.0`  | Accessible, unified iconography                                              |
| **Sass (SCSS)**      | `1.105.1` | Modular CSS architecture with design tokens, mixins, and theme variables     |

### Backend

| Technology             | Version  | Purpose                                                            |
| :--------------------- | :------- | :----------------------------------------------------------------- |
| **Node.js**            | `v18+`   | Native ES Modules JavaScript runtime (`"type": "module"`)          |
| **Express**            | `5.2.1`  | Web framework with native Promise/async error handling             |
| **MongoDB & Mongoose** | `9.10.2` | Document database with schema validation and unique indexes        |
| **JSONWebToken**       | `9.0.3`  | Cryptographic JWT token generation and verification                |
| **Bcrypt**             | `6.0.0`  | Secure one-way password hashing (10 salt rounds)                   |
| **Cookie-Parser**      | `1.4.7`  | Middleware to parse and read HTTP cookies                          |
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
│   │   │   │   ├── Navbar/                # Top navbar with user badge, theme toggle, logout
│   │   │   │   ├── Footer/                # Informative footer with repo link and tech tags
│   │   │   │   └── Toast/                 # Feedback toast alerts
│   │   │   └── features/
│   │   │       ├── auth/                  # Authentication Module
│   │   │       │   ├── components/        # LoginForm, RegisterForm
│   │   │       │   ├── context/           # AuthContext (user, login, logout, checkAuth)
│   │   │       │   ├── hooks/             # useAuth hook
│   │   │       │   ├── pages/             # LoginPage, RegisterPage
│   │   │       │   └── services/          # auth.api.js (Axios endpoints)
│   │   │       └── url/                   # Link Management Module
│   │   │           ├── components/        # UrlCard, UrlForm, UrlList, UrlResult, UrlStats
│   │   │           ├── context/           # UrlContext (URLs state, creation, deletion)
│   │   │           ├── hooks/             # useUrls, useClipboard
│   │   │           └── services/          # url.api.js (Axios endpoints)
│   │   ├── styles/                        # Modular SCSS design tokens and mixins
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
│   │   │   └── env.config.js              # Strict environment variable assertions
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js         # JWT cookie validation & blacklist check
│   │   │   ├── rateLimit.middleware.js    # Global, creation, and redirect rate limiters
│   │   │   └── validate.middleware.js     # express-validator schemas & 422 formatters
│   │   ├── models/
│   │   │   ├── blacklist.model.js         # Logged-out revoked tokens
│   │   │   ├── url.model.js               # Shortened link records with click tracking
│   │   │   └── user.model.js              # User account credentials
│   │   ├── modules/
│   │   │   ├── auth/                      # Auth controllers & routes (/api/auth)
│   │   │   └── url/                       # URL controllers & routes (/api/url)
│   │   ├── utils/
│   │   │   └── generateCode.js            # Cryptographically safe 6-char slug generator
│   │   └── app.js                         # Express configuration, static files & SPA fallback
│   ├── .env                               # Server environment variables (git-ignored)
│   ├── server.js                          # Database bootstrap & HTTP server entrypoint
│   └── package.json
│
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

1. `npm run build` compiles the React frontend into static assets located in `server/src/public`.
2. `npm start` launches Express, which serves both the REST API, short link redirects, and the React Single Page Application (SPA) on `http://localhost:3000`.

---

## API Reference

Base URL: `http://localhost:3000`

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint             | Access    | Description                                    |
| :----- | :------------------- | :-------- | :--------------------------------------------- |
| `POST` | `/api/auth/register` | Public    | Create a new user account                      |
| `POST` | `/api/auth/login`    | Public    | Authenticate user and receive HTTP cookie      |
| `POST` | `/api/auth/logout`   | Public    | Revoke session, blacklist token & clear cookie |
| `GET`  | `/api/auth/me`       | Protected | Fetch current authenticated user profile       |

#### Register User

`POST /api/auth/register`

```json
{
    "username": "alex",
    "email": "alex@example.com",
    "password": "Password123"
}
```

_Response (`201 Created`):_

```json
{
    "message": "user registration successfull",
    "data": {
        "username": "alex",
        "email": "alex@example.com"
    }
}
```

#### Login User

`POST /api/auth/login`

```json
{
    "email": "alex@example.com",
    "password": "Password123"
}
```

_Response (`200 OK` - Sets `token` cookie):_

```json
{
    "message": "Login successfull",
    "data": {
        "username": "alex",
        "email": "alex@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Verify Current Session

`GET /api/auth/me`
_Response (`200 OK`):_

```json
{
    "message": "user fetched successfully",
    "data": {
        "username": "alex",
        "email": "alex@example.com"
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

All `/api/url` endpoints require an authenticated session cookie.

| Method   | Endpoint                       | Rate Limit       | Description                                     |
| :------- | :----------------------------- | :--------------- | :---------------------------------------------- |
| `POST`   | `/api/url`                     | 10 req / min     | Shorten a target URL                            |
| `GET`    | `/api/url`                     | 200 req / 15 min | List all links (supports `?search=` query)      |
| `GET`    | `/api/url/:id`                 | 200 req / 15 min | Get details by Mongo `_id` or 6-char `shortUrl` |
| `DELETE` | `/api/url/:id`                 | 200 req / 15 min | Delete link by Mongo `_id` or 6-char `shortUrl` |
| `GET`    | `/api/url/redirect/:shortCode` | 60 req / min     | API-level redirection with atomic click count   |

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

---

### Public Redirection (`/:shortCode`)

```http
GET http://localhost:3000/:shortCode
```

- **Access**: Public (no login required for end users clicking shortened links).
- **Behavior**:
    - Increments the `clicks` counter atomically in MongoDB via `$inc`.
    - Responds with **HTTP 302 Found** directing the browser to the original destination URL.
    - Automatically responds with **204 No Content** if the browser requests `/favicon.ico`.
    - Returns **404 Not Found** if the short code does not exist.

---

## Security & Traffic Governance

1. **Password Encryption**: Passwords are salted and hashed using `bcrypt` (10 rounds). Plaintext passwords are never logged or stored.
2. **Stateless Token with Stateful Revocation**: JWTs are signed with a server secret (`7d` expiration). To prevent stolen or reused tokens after logout, the token is saved into a `blacklistTokens` collection and rejected on subsequent calls.
3. **Multi-Tier Rate Limiting**:
    - `globalLimiter`: 200 requests / 15 minutes across all routes.
    - `createUrlLimiter`: 10 requests / 1 minute per IP on `POST /api/url`.
    - `redirectLimiter`: 60 requests / 1 minute per IP on redirection endpoints.
4. **Input Validation**: `express-validator` rejects non-HTTP(S) URLs, oversized inputs (> 2048 characters), and invalid parameter formats with structured `422 Unprocessable Entity` payloads.
5. **Regex Sanitization**: Link search queries are cleansed of special regex control characters prior to building queries, mitigating ReDoS vulnerabilities.

---

## Helpful Scripts

### Root Directory

- `npm run format`: Runs Prettier across all `.js`, `.jsx`, `.scss`, and `.md` files.
- `npm run format:check`: Validates formatting consistency.

### Client Directory (`cd client`)

- `npm run dev`: Launches Vite development server on port 5173.
- `npm run build`: Bundles the client for distribution.
- `npm run lint`: Checks for React and JavaScript syntax warnings with ESLint.

### Server Directory (`cd server`)

- `npm run dev`: Runs the API with live reload via `nodemon`.
- `npm run build`: Automatically compiles the client and bundles it directly into `server/src/public`.
- `npm start`: Starts the production Express server serving API + static assets.

---

## License

This project is licensed under the ISC License. Feel free to use, modify, and distribute it for personal and commercial projects.
