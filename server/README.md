# Shortly Server — Architecture & Implementation

A production-grade, modular backend service and high-throughput redirection engine powering the **Shortly** URL shortening platform. Built with **Node.js (ES Modules)**, **Express 5**, and **MongoDB (Mongoose 9)**.

---

## Table of Contents

- [Architectural Overview](#-architectural-overview)
    - [Request Lifecycle & Middleware Pipeline](#request-lifecycle--middleware-pipeline)
    - [Design Philosophy](#design-philosophy)
- [Module Architecture & Directory Breakdown](#-module-architecture--directory-breakdown)
- [Authentication & Session Engine](#-authentication--session-engine)
    - [Bcrypt Password Hashing](#1-bcrypt-password-hashing)
    - [JWT Token Strategy](#2-jwt-token-strategy)
    - [Blacklist Token Revocation (Stateful Logout)](#3-blacklist-token-revocation-stateful-logout)
    - [Authentication Middleware (`authUser`)](#4-authentication-middleware-authuser)
- [URL Engine & Redirection Mechanism](#-url-engine--redirection-mechanism)
    - [Base62 Slug Generation & Collision Resistance](#1-base62-slug-generation--collision-resistance)
    - [Atomic Visit Tracking (`$inc`)](#2-atomic-visit-tracking-inc)
    - [Dual Redirection Endpoints](#3-dual-redirection-endpoints)
    - [Browser Prefetch Filtering (`favicon.ico`)](#4-browser-prefetch-filtering-faviconico)
    - [Dual-Identifier Lookup Strategy](#5-dual-identifier-lookup-strategy)
    - [ReDoS-Safe URL Search](#6-redos-safe-url-search)
- [Validation & Traffic Control](#-validation--traffic-control)
    - [express-validator Middleware](#1-express-validator-middleware)
    - [Standardized 422 Error Envelope](#2-standardized-422-error-envelope)
    - [Tiered Rate Limiting](#3-tiered-rate-limiting)
- [Database Models & Indexing](#-database-models--indexing)
    - [`users` Model](#1-users-model)
    - [`urls` Model](#2-urls-model)
    - [`blacklistTokens` Model](#3-blacklisttokens-model)
- [Configuration & Bootstrapping](#-configuration--bootstrapping)
    - [Strict Environment Assertions](#strict-environment-assertions)
    - [MongoDB Connection Resilience](#mongodb-connection-resilience)
- [Single-Port Full-Stack Deployment](#-single-port-full-stack-deployment)
    - [The Client Build Pipeline (`scripts/build-client.js`)](#the-client-build-pipeline-scriptsbuild-clientjs)
    - [SPA Fallback Routing in Express 5](#spa-fallback-routing-in-express-5)
- [Complete API Reference](#-complete-api-reference)
    - [Authentication API (`/api/auth`)](#1-authentication-api-apiauth)
    - [URL Management API (`/api/url`)](#2-url-management-api-apiurl)
    - [Public Redirection (`/:shortCode`)](#3-public-redirection-shortcode)
- [HTTP Status Code Matrix](#-http-status-code-matrix)
- [Development & Operations](#-development--operations)

---

## Architectural Overview

The Shortly backend follows a modular, layer-separated architecture using native **ES Modules** (`"type": "module"` in `package.json`). Code is organized by domain modules (`auth`, `url`), clean cross-cutting middleware (validation, rate limiting, authentication), centralized models, and environment safety checks.

### Request Lifecycle & Middleware Pipeline

```text
                                    ┌──────────────────────────────┐
                                    │    Incoming HTTP Request     │
                                    └──────────────┬───────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │      express.static()        │  Serves assets from src/public
                                    └──────────────┬───────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │ express.json() & cookieParser│  Body parsing & Cookie decoding
                                    └──────────────┬───────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │       morgan('combined')     │  HTTP Access Logging
                                    └──────────────┬───────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │        globalLimiter         │  200 requests / 15 min per IP
                                    └──────────────┬───────────────┘
                                                   │
           ┌───────────────────────────────────────┼────────────────────────────────────────┐
           │                                       │                                        │
           ▼                                       ▼                                        ▼
┌──────────────────────┐               ┌──────────────────────┐                ┌─────────────────────────┐
│   /api/auth Router   │               │   /api/url Router    │                │  GET /:shortCode        │
│                      │               │                      │                │  (Public Redirection)   │
│  - /register (Val)   │               │  - authUser Guard    │                └────────────┬────────────┘
│  - /login (Val)      │               │  - Route Rate Limit  │                             │
│  - /logout           │               │  - express-validator │                             ▼
│  - /me (JWT Check)   │               │  - URL Controller    │                ┌─────────────────────────┐
└──────────┬───────────┘               └──────────┬───────────┘                │ findOneAndUpdate($inc)  │
           │                                      │                            │ 302 Redirect Location   │
           └───────────────────┬──────────────────┘                            └─────────────────────────┘
                               │
                               ▼
                ┌─────────────────────────────┐
                │     Mongoose 9 ODM Layer    │
                │     (MongoDB Atlas/Local)   │
                └──────────────┬──────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │        SPA Fallback Route (Wildcard GET)     │
        │  Sends server/src/public/index.html for non- │
        │  API browser routes (e.g. /login, /register) │
        └──────────────────────────────────────────────┘
```

### Design Philosophy

1. **Separation of Concerns**: Routes declare schemas and middleware chains; controllers handle business logic and status codes; models enforce persistence boundaries.
2. **Defensive Validation**: Bad payloads are caught and rejected with descriptive field-level error messages before touching controller logic or database queries.
3. **Atomic Concurrency**: Link visits update counters atomically at the database layer using MongoDB's `$inc` operator, preventing lost updates under concurrent access.
4. **Resilient Defaults**: Strict startup validation ensures the application immediately crashes on launch if required secrets or connection strings are missing, rather than failing subtly during runtime.

---

## Module Architecture & Directory Breakdown

```text
server/
├── scripts/
│   └── build-client.js               # Cross-platform build automation script
│                                     # Invokes Vite build with client -> server/src/public output
├── src/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection initialization and lifecycle logging
│   │   └── env.config.js             # Centralized environment assertions and exports
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js        # authUser JWT token verification and blacklist check
│   │   ├── rateLimit.middleware.js   # express-rate-limit tiers (global, creation, redirect)
│   │   └── validate.middleware.js    # express-validator schemas and 422 error interceptor
│   │
│   ├── models/
│   │   ├── blacklist.model.js        # Blacklisted JWT tokens schema (revoked sessions)
│   │   ├── url.model.js              # Shortened URL schema with unique slug index and click counter
│   │   └── user.model.js             # User account schema with hashed credentials
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   │   └── auth.controller.js# register, login, logout, getMe controllers
│   │   │   └── routes/
│   │   │       └── auth.route.js     # /api/auth routing definitions
│   │   │
│   │   └── url/
│   │       ├── controllers/
│   │       │   └── url.controller.js # shorten, list, getById, delete, redirect controllers
│   │       └── routes/
│   │           └── url.routes.js     # /api/url routing definitions
│   │
│   ├── utils/
│   │   └── generateCode.js           # 6-character Base62 alphanumeric slug generator
│   │
│   └── app.js                        # Express application composition, middleware, and SPA routing
│
├── .env                              # Environment variables (git-ignored)
├── package.json                      # Server scripts and dependencies
├── README.md                         # Server documentation (you are here)
└── server.js                         # Database connection bootstrapper and HTTP server listener
```

---

## Authentication & Session Engine

The authentication system combines stateless JWT tokens with stateful database revocation to provide both high verification speed and secure logout handling.

### 1. Bcrypt Password Hashing

During user registration (`registerUserController`):

- The client-submitted password is verified to meet length criteria (minimum 8 characters).
- Password is salted and hashed using `bcrypt.hash(password, 10)` with **10 salt rounds**.
- The plain password is never saved or logged; only the irreversible hash is written to the `users` collection.
- During login (`loginUserController`), passwords are verified using constant-time comparison via `bcrypt.compare(password, user.password)`.

### 2. JWT Token Strategy

When a user logs in successfully:

- A JSON Web Token is signed using `jsonwebtoken`:
    ```javascript
    const token = jwt.sign({ id: user._id }, envConfig.JWT_SECRET, { expiresIn: '7d' });
    ```
- The token is placed into an HTTP cookie named `token`:
    ```javascript
    res.cookie('token', token);
    ```
- The client receives the cookie automatically and includes it with subsequent requests because the Axios instances use `withCredentials: true`.

### 3. Blacklist Token Revocation (Stateful Logout)

Traditional stateless JWTs remain valid until their expiration timestamp even if a user explicitly logs out. Shortly prevents this vulnerability:

1. When a user calls `POST /api/auth/logout`, the server extracts the cookie.
2. The server creates a record in the `blacklistTokens` collection containing the token:
    ```javascript
    await blacklistTokenModel.create({ token });
    ```
3. The server clears the cookie via `res.clearCookie('token')`.
4. Any future request attempting to present this token will be rejected immediately by the authentication middleware.

### 4. Authentication Middleware (`authUser`)

Located in `src/middleware/auth.middleware.js`:

```javascript
export async function authUser(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'token not provided' });
    }

    try {
        const isTokenBlacklisted = await blacklistTokenModel.findOne({ token });
        if (isTokenBlacklisted) {
            return res.status(401).json({ message: 'token is invalid' });
        }

        const decoded = jwt.verify(token, envConfig.JWT_SECRET);
        req.user = decoded; // { id: '...', iat: ..., exp: ... }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
```

---

## URL Engine & Redirection Mechanism

### 1. Base62 Slug Generation & Collision Resistance

Short codes are produced by `src/utils/generateCode.js`:

- Uses the standard Base62 character alphabet:
    ```
    0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
    ```
- Randomly generates a 6-character string.
- Permutation space: $62^6 = 56,800,235,584$ (over **56.8 billion** unique combinations).

#### Active Collision Protection Loop

In `createShortenUrl`:

```javascript
let shortCode = generateCode();
let attempts = 0;
while (await urlModel.findOne({ shortUrl: shortCode })) {
    shortCode = generateCode();
    attempts++;
    if (attempts > 5) {
        return res.status(500).json({
            error: 'Failed to generate unique short code, please try again',
        });
    }
}
```

If an existing document has the same slug, the engine re-rolls up to 5 times before failing safely.

### 2. Atomic Visit Tracking (`$inc`)

In high-concurrency environments, reading a document, incrementing the counter in JavaScript, and saving it back causes lost updates (race condition). Shortly prevents this by using MongoDB's atomic `$inc` update operator:

```javascript
const urlDoc = await urlModel.findOneAndUpdate(
    { shortUrl: shortCode },
    { $inc: { clicks: 1 } },
    { new: true },
);
```

This single query updates the document atomically within the MongoDB engine and returns the updated document in one round-trip.

### 3. Dual Redirection Endpoints

1. **Root Redirection (`GET /:shortCode`)**:
    - Mounted in `src/app.js`: `app.get('/:shortCode', redirectUrl)`.
    - Public route for direct end-user navigation (no auth required).
    - Generates clean links like `http://localhost:3000/k9xL2p`.
2. **API Redirection (`GET /api/url/redirect/:shortCode`)**:
    - Mounted in `src/modules/url/routes/url.routes.js`.
    - Protected by `authUser` and restricted by `redirectLimiter` (60 req/min).

### 4. Browser Prefetch Filtering (`favicon.ico`)

Modern browsers automatically request `GET /favicon.ico` when a user loads a URL. Without special handling, the server would interpret `favicon.ico` as a short code, query MongoDB, fail, or miscalculate click metrics:

```javascript
if (shortCode === 'favicon.ico') {
    return res.status(204).end();
}
```

The server immediately responds with `204 No Content` without performing a database lookup.

### 5. Dual-Identifier Lookup Strategy

Endpoints like `GET /api/url/:id` and `DELETE /api/url/:id` allow users or frontends to pass either a 24-character hexadecimal MongoDB `ObjectId` or the 6-character `shortUrl` string:

```javascript
let url = null;
if (mongoose.Types.ObjectId.isValid(id)) {
    url = await urlModel.findById(id);
}
if (!url) {
    url = await urlModel.findOne({ shortUrl: id });
}
```

Evaluating `mongoose.Types.ObjectId.isValid(id)` first prevents Mongoose `CastError` exceptions when checking 6-character alphanumeric slugs.

### 6. ReDoS-Safe URL Search

In `getAllUrls`, search queries from the client (`?search=query`) filter both the original URL and the short code:

```javascript
if (queryTerm) {
    const escaped = queryTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escaped, 'i');
    filter = {
        $or: [{ shortUrl: searchRegex }, { originalUrl: searchRegex }],
    };
}
```

All special RegExp metacharacters are escaped prior to regex instantiation, preventing Regular Expression Denial of Service (ReDoS) vulnerabilities.

---

## Validation & Traffic Control

### 1. express-validator Middleware

Validation rules are consolidated in `src/middleware/validate.middleware.js`:

| Validator Chain          | Target Fields                           | Rules Enforced                                          |
| :----------------------- | :-------------------------------------- | :------------------------------------------------------ |
| `validateRegister`       | `username`, `email`, `password`         | Non-empty, valid email syntax, password minimum 8 chars |
| `validateLogin`          | `email`, `password`                     | Non-empty, valid email syntax, password minimum 8 chars |
| `validateCreateUrl`      | `url`, `alias` (opt), `expiresIn` (opt) | Valid `http://` or `https://` protocol, max 2048 chars  |
| `validateIdParam`        | `id`                                    | Non-empty string, max 100 chars                         |
| `validateShortCodeParam` | `shortCode`                             | Alphanumeric + hyphens, 4–20 characters                 |

### 2. Standardized 422 Error Envelope

When validation fails, `handleValidationErrors` halts request execution and returns an error response in this consistent format:

```json
{
    "error": "Validation failed",
    "details": [
        {
            "field": "url",
            "message": "url must start with http:// or https:// and be a valid URL"
        }
    ]
}
```

### 3. Tiered Rate Limiting

Implemented via `express-rate-limit` using standard RFC Draft-7 headers (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`):

1. **Global Limiter (`globalLimiter`)**:
    - `windowMs`: 15 minutes (900,000 ms)
    - `max`: 200 requests per IP
    - Applied globally in `app.js`.
2. **Creation Limiter (`createUrlLimiter`)**:
    - `windowMs`: 1 minute (60,000 ms)
    - `max`: 10 requests per IP
    - Applied on `POST /api/url` to curb bulk link generation spam.
3. **Redirection Limiter (`redirectLimiter`)**:
    - `windowMs`: 1 minute (60,000 ms)
    - `max`: 60 requests per IP
    - Applied on `GET /api/url/redirect/:shortCode`.

---

## Database Models & Indexing

### 1. `users` Model

Stored in the `users` collection (`src/models/user.model.js`):

```javascript
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'username is required'],
    },
    email: {
        type: String,
        required: [true, 'email is required'],
    },
    password: {
        type: String,
        required: [true, 'password is required'],
    },
});
```

### 2. `urls` Model

Stored in the `urls` collection (`src/models/url.model.js`):

```javascript
const urlSchema = new mongoose.Schema(
    {
        originalUrl: {
            type: String,
            required: true,
            trim: true,
        },
        shortUrl: {
            type: String,
            required: true,
            unique: true, // Generates unique B-tree index
            trim: true,
            index: true, // Ensures sub-millisecond lookup during redirection
        },
        clicks: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, // Automatically creates createdAt and updatedAt
    },
);
```

### 3. `blacklistTokens` Model

Stored in the `blacklistTokens` collection (`src/models/blacklist.model.js`):

```javascript
const blacklistTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, 'token is required'],
        },
    },
    {
        timestamps: true,
    },
);
```

---

## Configuration & Bootstrapping

### Strict Environment Assertions

Configuration is centralized in `src/config/env.config.js`. It runs runtime assertions to prevent the server from running in a partially configured state:

```javascript
if (!process.env.DATABASE_URL) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: DATABASE_URL');
}

if (!process.env.JWT_SECRET) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: JWT_SECRET');
}
```

#### Exported Configuration Object

```javascript
const envConfig = {
    SERVER_PORT: process.env.SERVER_PORT || 3000,
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
};
```

### MongoDB Connection Resilience

In `src/config/db.js`, connection lifecycle events are monitored:

- `connected`: Logs successful database connection.
- `error`: Logs runtime database connectivity errors.
- `disconnected`: Warns if the database connection drops unexpectedly.

`server.js` enforces the connection before accepting incoming traffic:

```javascript
connectDb().then(() => {
    app.listen(envConfig.SERVER_PORT, () => {
        console.log(`Server listening on port ${envConfig.SERVER_PORT}`);
    });
});
```

---

## Single-Port Full-Stack Deployment

The Shortly architecture supports serving both the React frontend and the Express backend from a single unified server instance.

### The Client Build Pipeline (`scripts/build-client.js`)

The `scripts/build-client.js` script handles building the client assets:

1. Checks that the `client/` directory exists.
2. Automatically executes `npm install --include=dev` in `client/` if `node_modules` is absent.
3. Ensures `server/src/public/` exists.
4. Executes `vite build --outDir <targetPublicDir> --emptyOutDir`.

### SPA Fallback Routing in Express 5

In `src/app.js`, Express serves static assets from `server/src/public`. For non-API routes requested in the browser (such as `/login`, `/register`, or `/`), Express serves `index.html` so React Router can handle routing on the client:

```javascript
app.use(express.static(publicPath));

// API routes mounted here...

// SPA Fallback
app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
        return next();
    }
    const indexPath = path.join(publicPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) next();
    });
});
```

---

## Complete API Reference

Base URL: `http://localhost:3000`

### 1. Authentication API (`/api/auth`)

#### `POST /api/auth/register`

Creates a new user profile.

- **Headers**: `Content-Type: application/json`
- **Request Body**:
    ```json
    {
        "username": "aman",
        "email": "aman@example.com",
        "password": "SecretPassword123"
    }
    ```
- **Responses**:
    - `201 Created`:
        ```json
        {
            "message": "user registration successfull",
            "data": {
                "username": "aman",
                "email": "aman@example.com"
            }
        }
        ```
    - `400 Bad Request`: `{ "message": "username already exists" }` or `{ "message": "user already exists with this email" }`
    - `422 Unprocessable Entity`: Validation failure (short password or invalid email syntax).

#### `POST /api/auth/login`

Authenticates a user and establishes an HTTP cookie session.

- **Headers**: `Content-Type: application/json`
- **Request Body**:
    ```json
    {
        "email": "aman@example.com",
        "password": "SecretPassword123"
    }
    ```
- **Responses**:
    - `200 OK` (Sets cookie `token`):
        ```json
        {
            "message": "Login successfull",
            "data": {
                "username": "aman",
                "email": "aman@example.com"
            },
            "token": "eyJhbGciOiJIUzI1NiIsIn..."
        }
        ```
    - `400 Bad Request`: `{ "message": "No user exists with this email" }` or `{ "message": "Entered password is incorrect" }`

#### `GET /api/auth/me`

Fetches the active user profile from the provided cookie session.

- **Cookies**: `token=<jwt>`
- **Responses**:
    - `200 OK`:
        ```json
        {
            "message": "user fetched successfully",
            "data": {
                "username": "aman",
                "email": "aman@example.com"
            },
            "token": "eyJhbGciOiJIUzI1NiIsIn..."
        }
        ```
    - `401 Unauthorized`: `{ "message": "token not provided" }` or `{ "message": "invalid or expired token" }`

#### `POST /api/auth/logout`

Revokes the current session token and clears the cookie.

- **Cookies**: `token=<jwt>`
- **Responses**:
    - `200 OK`:
        ```json
        {
            "message": "logged out successfully"
        }
        ```
    - `400 Bad Request`: `{ "message": "token is required for logging out" }`

---

### 2. URL Management API (`/api/url`)

> [!NOTE]
> All endpoints under `/api/url` require an authenticated session cookie via `authUser` middleware.

#### `POST /api/url`

Creates a shortened URL.

- **Rate Limit**: 10 requests / 1 minute per IP.
- **Request Body**:
    ```json
    {
        "url": "https://nodejs.org/docs/latest-v20.x/api/"
    }
    ```
- **Responses**:
    - `201 Created`:
        ```json
        {
            "message": "shorten url created successfully",
            "data": {
                "id": "6724a1f3c5d8a9e71b2f4a12",
                "originalUrl": "https://nodejs.org/docs/latest-v20.x/api/",
                "shortUrl": "aB3dE1",
                "fullShortUrl": "http://localhost:3000/aB3dE1",
                "clicks": 0,
                "createdAt": "2026-10-15T06:30:00.000Z"
            }
        }
        ```
    - `422 Unprocessable Entity`: Invalid URL format or protocol missing.

#### `GET /api/url`

Retrieves all shortened links, with optional search query filtering.

- **Query Parameters**:
    - `search` or `q` (optional): Filter string matching `originalUrl` or `shortUrl`.
- **Responses**:
    - `200 OK`:
        ```json
        {
            "message": "URLs fetched successfully",
            "data": {
                "urls": [
                    {
                        "_id": "6724a1f3c5d8a9e71b2f4a12",
                        "originalUrl": "https://nodejs.org/docs/latest-v20.x/api/",
                        "shortUrl": "aB3dE1",
                        "clicks": 7,
                        "createdAt": "2026-10-15T06:30:00.000Z",
                        "updatedAt": "2026-10-15T07:15:00.000Z"
                    }
                ]
            }
        }
        ```

#### `GET /api/url/:id`

Retrieves link details by either MongoDB `_id` or 6-character `shortUrl`.

- **Parameters**: `:id` (e.g. `6724a1f3c5d8a9e71b2f4a12` or `aB3dE1`)
- **Responses**:
    - `200 OK`:
        ```json
        {
            "message": "url fetched successfully",
            "data": {
                "url": {
                    "_id": "6724a1f3c5d8a9e71b2f4a12",
                    "originalUrl": "https://nodejs.org/docs/latest-v20.x/api/",
                    "shortUrl": "aB3dE1",
                    "clicks": 7,
                    "createdAt": "2026-10-15T06:30:00.000Z",
                    "updatedAt": "2026-10-15T07:15:00.000Z"
                }
            }
        }
        ```
    - `404 Not Found`: `{ "error": "No url exists with this Id or short code" }`

#### `DELETE /api/url/:id`

Deletes a link by either MongoDB `_id` or 6-character `shortUrl`.

- **Parameters**: `:id`
- **Responses**:
    - `200 OK`: `{ "message": "Url deleted successfully" }`
    - `404 Not Found`: `{ "error": "No url exists with this id and shorturl" }`

#### `GET /api/url/redirect/:shortCode`

API-namespaced redirection.

- **Rate Limit**: 60 requests / 1 minute per IP.
- **Responses**:
    - `302 Found`: Redirects browser to destination `originalUrl`.
    - `404 Not Found`: `{ "error": "Short URL not found" }`

---

### 3. Public Redirection (`/:shortCode`)

```http
GET http://localhost:3000/:shortCode
```

- **Authentication**: None (Public).
- **Behavior**:
    - Atomically increments click counter via `$inc`.
    - Responds with `302 Found` to `originalUrl`.
    - Returns `204 No Content` for `favicon.ico`.
    - Returns `404 Not Found` if short code doesn't exist.

---

## HTTP Status Code Matrix

| Status Code                | Meaning                        | Context / Route                                                                                        |
| :------------------------- | :----------------------------- | :----------------------------------------------------------------------------------------------------- |
| `200 OK`                   | Success with payload           | `GET /api/url`, `GET /api/url/:id`, `GET /api/auth/me`, `DELETE /api/url/:id`, `POST /api/auth/logout` |
| `201 Created`              | Resource persisted             | `POST /api/url`, `POST /api/auth/register`                                                             |
| `204 No Content`           | Handled with no content        | Suppressed browser `GET /favicon.ico`                                                                  |
| `302 Found`                | HTTP Redirection               | Successful link navigation via `/:shortCode`                                                           |
| `400 Bad Request`          | Missing input / logic mismatch | Duplicate username/email, missing parameters                                                           |
| `401 Unauthorized`         | Missing / invalid token        | Protected routes when unauthenticated or token revoked                                                 |
| `404 Not Found`            | Document not found             | Non-existent short codes or URL IDs                                                                    |
| `422 Unprocessable Entity` | Validation failure             | Schema rule violations (`express-validator`)                                                           |
| `429 Too Many Requests`    | Rate limit breached            | Exceeding 10 creates/min, 60 redirects/min, or 200 req/15min                                           |
| `500 Internal Error`       | Server exception               | Uncaught exception or database connection failure                                                      |

---

## Development & Operations

### Install Dependencies

```bash
cd server
npm install
```

### Start Development Server (Nodemon)

```bash
npm run dev
```

### Build Client Bundle for Single-Port Production

```bash
npm run build
```

### Run Server in Production

```bash
npm start
```
