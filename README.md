<h1 align="center">Shortly - URL Shortener</h1>

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.10.2-880000?style=flat-square&logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io)

A high-performance, full-stack URL shortening service and analytics engine built with **React 19**, **Vite**, **Express 5**, and **MongoDB**. Transform unwieldy web addresses into clean, collision-safe 6-character links with real-time atomic visit tracking, dual redirection pathways, tiered rate limiting, and an interface styled in a minimalist black-and-white design system.

---

## Table of Contents

- [Key Highlights](#-key-highlights)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [1. Environment Variables](#1-environment-variables)
    - [2. Server Setup](#2-server-setup)
    - [3. Client Setup](#3-client-setup)
- [API Reference](#-api-reference)
    - [Endpoints Overview](#endpoints-overview)
    - [Endpoint Specifications & cURL Samples](#endpoint-specifications--curl-samples)
- [Frontend Features & User Experience](#-frontend-features--user-experience)
- [Security & Traffic Governance](#-security--traffic-governance)
- [Code Quality & Formatting](#-code-quality--formatting)
- [License](#-license)

---

## Key Highlights

- **Collision-Safe 6-Character Slugs**: Automatically derives randomized base62-style alphanumeric slugs (`[a-zA-Z0-9]`), offering over 56.8 billion unique combinations.
- **Atomic Click Analytics**: Every redirection executes an atomic `$inc` operation on MongoDB, preventing race conditions even under concurrent load.
- **Dual Redirection Architecture**:
    - **Direct Root Redirect**: `http://localhost:3000/:shortCode` for streamlined link sharing.
    - **RESTful API Redirect**: `http://localhost:3000/api/url/redirect/:shortCode` for programmatic consumers.
- **Smart Dual-Identifier Lookup**: Query endpoints seamlessly by 24-character MongoDB `_id` or 6-character `shortUrl` without trigger errors.
- **Tiered Traffic Control**: Protected by `express-rate-limit` with global IP quotas and specialized per-route limits (10 creations/min, 60 redirects/min).
- **Strict Input Validation**: Validates protocol bounds (`http://` or `https://`), enforces a 2048-character maximum length, and suppresses unwanted `favicon.ico` queries.
- **Minimalist Black & White UI**: Built with custom SCSS design tokens, fluid dark/light mode toggles, real-time live link filtering, and interactive statistics.

---

## System Architecture

```
                                 ┌─────────────────────────┐
                                 │   Browser / Client      │
                                 │  React 19 + SCSS System │
                                 └────────────┬────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
               Direct Link Visit                                REST API Calls
          (GET http://localhost:3000/:code)                  (POST / GET / DELETE)
                      │                                               │
                      ▼                                               ▼
      ┌─────────────────────────────────┐             ┌─────────────────────────────────┐
      │       Root Route Handler        │             │        /api/url Router          │
      │   (Redirect & Atomic Tracker)   │             │   (Validation & Rate Limits)    │
      └───────────────┬─────────────────┘             └───────────────┬─────────────────┘
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │     Express 5 Controller    │
                               └──────────────┬──────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │   Mongoose 9 Data Layer     │
                               │  - Schema Indexes           │
                               │  - Atomic Increment ($inc)  │
                               └──────────────┬──────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │   MongoDB Atlas / Local     │
                               └─────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology       | Version   | Purpose                                                                      |
| :--------------- | :-------- | :--------------------------------------------------------------------------- |
| **React**        | `19.1.0`  | Component-driven UI library leveraging modern hooks & state management       |
| **Vite**         | `6.3.5`   | Next-generation frontend build tool with lightning-fast HMR and API proxying |
| **Axios**        | `1.20.0`  | Promise-based HTTP client for seamless backend communications                |
| **Lucide React** | `1.49.0`  | Clean, accessible icon system                                                |
| **Sass (SCSS)**  | `1.105.1` | Modular CSS architecture with design tokens, mixins, and theme variables     |

### Backend

| Technology             | Version  | Purpose                                                                 |
| :--------------------- | :------- | :---------------------------------------------------------------------- |
| **Node.js**            | `v18+`   | Runtime environment executing native ES Modules (`"type": "module"`)    |
| **Express**            | `5.2.1`  | Next-generation web framework with native async error handling          |
| **MongoDB**            | `v6+`    | Scalable NoSQL document database                                        |
| **Mongoose**           | `9.10.2` | Elegant MongoDB object modeling with strict schemas and unique indexing |
| **Express Validator**  | `7.3.2`  | Declarative schema validation and sanitization middleware               |
| **Express Rate Limit** | `8.7.0`  | IP-based request rate limiting to mitigate abuse and denial-of-service  |
| **Morgan**             | `1.12.1` | HTTP request logger middleware                                          |

---

## Project Structure

```text
url-shortner/
├── client/                                # React 19 Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/                # Core Shared Components
│   │   │   │   ├── Navbar/                # Navigation bar with dark/light mode toggle
│   │   │   │   ├── Footer/                # Clean footer with tech stack pills
│   │   │   │   └── Toast/                 # Global feedback notification system
│   │   │   └── features/
│   │   │       └── url/                   # Feature Module: URL Management
│   │   │           ├── components/
│   │   │           │   ├── UrlCard/       # Link item card (copy, delete, click counters)
│   │   │           │   ├── UrlForm/       # Input form for shortening new URLs
│   │   │           │   ├── UrlList/       # Searchable list of shortened URLs
│   │   │           │   ├── UrlResult/     # Success banner for freshly generated links
│   │   │           │   └── UrlStats/      # Live analytics overview dashboard
│   │   │           ├── context/           # React Context Provider (UrlContext)
│   │   │           ├── hooks/             # Custom hooks (useUrls, useClipboard)
│   │   │           └── services/          # Axios API communication layer
│   │   ├── styles/                        # Global Sass Design System
│   │   │   ├── _mixins.scss               # Responsive breakpoints, resets & card styles
│   │   │   ├── _reset.scss                # Normalize & CSS reset
│   │   │   ├── _variables.scss            # Black & white design tokens, fonts & themes
│   │   │   └── main.scss                  # Layout container & background grid
│   │   ├── App.jsx                        # Application root layout
│   │   └── main.jsx                       # React DOM entry point
│   ├── index.html                         # HTML template with Google Fonts (Plus Jakarta Sans)
│   ├── vite.config.js                     # Vite dev server with /api proxy to port 3000
│   └── package.json
│
├── server/                                # Express 5 Backend API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                      # MongoDB connection handler with reconnection logic
│   │   │   └── env.config.js              # Environment variable loader
│   │   ├── middleware/
│   │   │   ├── rateLimit.middleware.js    # Global, creation & redirect rate limiters
│   │   │   └── validate.middleware.js     # express-validator schemas for URLs & parameters
│   │   ├── models/
│   │   │   └── url.model.js               # Mongoose schema with unique indexes on shortUrl
│   │   ├── modules/
│   │   │   └── url/
│   │   │       ├── controllers/           # Controller actions (shorten, list, get, delete, redirect)
│   │   │       └── routes/                # Express router mounted at /api/url
│   │   ├── utils/
│   │   │   └── generateCode.js            # Cryptographically safe 6-character code generator
│   │   └── app.js                         # Express app configuration & middleware pipeline
│   ├── server.js                          # Server bootstrapper & port listener
│   └── package.json
│
├── .prettierrc                            # Unified Prettier formatting rules
├── .prettierignore                        # Prettier ignore paths
├── package.json                           # Root scripts for repository-wide formatting & linting
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ / v22+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: A running local MongoDB daemon (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

---

### 1. Environment Variables

Create a `.env` file in the `server/` directory:

```bash
# Path: server/.env

# MongoDB Connection URI (Atlas or Local)
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/url-shortener?retryWrites=true&w=majority

# Port for Express server
PORT=3000

# Base public URL used for returning full short link strings
SERVER_URL=http://localhost:3000

# Environment mode
NODE_ENV=development
```

---

### 2. Server Setup

Open a terminal and navigate to the `server/` directory:

```bash
cd server

# Install backend dependencies
npm install

# Start the server with Nodemon (auto-reloads on file changes)
npm run dev
```

The server will start listening at **`http://localhost:3000`**.

---

### 3. Client Setup

In a second terminal window, navigate to the `client/` directory:

```bash
cd client

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

The web app will run at **`http://localhost:5173`**. Requests made to `/api/*` are automatically proxied to `http://localhost:3000` via Vite's proxy configuration in [vite.config.js](file:///client/vite.config.js).

---

## API Reference

### Endpoints Overview

| Method   | Endpoint                       | Description                                         | Rate Limit       |
| :------- | :----------------------------- | :-------------------------------------------------- | :--------------- |
| `GET`    | `/`                            | API status check & endpoint sitemap                 | 200 req / 15 min |
| `POST`   | `/api/url`                     | Create a new shortened link                         | 10 req / 1 min   |
| `GET`    | `/api/url`                     | List all shortened links or search (`?search=term`) | 200 req / 15 min |
| `GET`    | `/api/url/:id`                 | Get single URL by MongoDB `_id` or `shortUrl`       | 200 req / 15 min |
| `DELETE` | `/api/url/:id`                 | Delete a URL by MongoDB `_id` or `shortUrl`         | 200 req / 15 min |
| `GET`    | `/:shortCode`                  | Root redirect to destination + atomic click `+1`    | 60 req / 1 min   |
| `GET`    | `/api/url/redirect/:shortCode` | API redirect to destination + atomic click `+1`     | 60 req / 1 min   |

---

### Endpoint Specifications & cURL Samples

#### 1. Create Shortened URL

```bash
curl -X POST http://localhost:3000/api/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"}'
```

**Response (`201 Created`):**

```json
{
    "message": "shorten url created successfully",
    "data": {
        "id": "6724a1f3c5d8a9e71b2f4a12",
        "originalUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        "shortUrl": "aB3eZ1",
        "fullShortUrl": "http://localhost:3000/aB3eZ1",
        "clicks": 0,
        "createdAt": "2026-10-02T10:00:00.000Z"
    }
}
```

---

#### 2. Redirect to Original URL

Accessing either `http://localhost:3000/:shortCode` or `http://localhost:3000/api/url/redirect/:shortCode`:

```bash
curl -i http://localhost:3000/aB3eZ1
```

**Response (`302 Found`):**

```http
HTTP/1.1 302 Found
Location: https://developer.mozilla.org/en-US/docs/Web/JavaScript
```

_Note: The `clicks` metric is automatically incremented in MongoDB via `$inc: { clicks: 1 }`._

---

#### 3. Fetch All URLs / Search

```bash
# Fetch all URLs (sorted newest first)
curl http://localhost:3000/api/url

# Or search URLs matching a specific term or short code
curl "http://localhost:3000/api/url?search=github"
```

**Response (`200 OK`):**

```json
{
    "message": "URLs fetched successfully",
    "data": {
        "urls": [
            {
                "_id": "6724a1f3c5d8a9e71b2f4a12",
                "originalUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                "shortUrl": "aB3eZ1",
                "clicks": 14,
                "createdAt": "2026-10-02T10:00:00.000Z",
                "updatedAt": "2026-10-02T10:15:00.000Z"
            }
        ]
    }
}
```

---

#### 4. Fetch URL Details (by ID or Slug)

```bash
# Lookup by MongoDB ObjectId
curl http://localhost:3000/api/url/6724a1f3c5d8a9e71b2f4a12

# Or lookup directly by 6-character short code
curl http://localhost:3000/api/url/aB3eZ1
```

**Response (`200 OK`):**

```json
{
    "message": "url fetched successfully",
    "data": {
        "url": {
            "_id": "6724a1f3c5d8a9e71b2f4a12",
            "originalUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
            "shortUrl": "aB3eZ1",
            "clicks": 14,
            "createdAt": "2026-10-02T10:00:00.000Z"
        }
    }
}
```

---

#### 5. Delete a URL

```bash
curl -X DELETE http://localhost:3000/api/url/aB3eZ1
```

**Response (`200 OK`):**

```json
{
    "message": "Url deleted successfully"
}
```

---

## Frontend Features & User Experience

- **Minimalist Aesthetic**: Engineered with a high-contrast black-and-white visual hierarchy, subtle borders, dot-grid background, and soft depth shadows.
- **Dark Mode Support**: Seamless toggle between Light and Dark themes stored in `localStorage`, adhering to system preferences.
- **Analytics Dashboard**: The `UrlStats` component calculates total generated links, total aggregate clicks across all URLs, and the most active link in real time.
- **Interactive Search Filter**: Instantly search across original URLs and short codes without re-fetching from the database.
- **One-Click Clipboard Copy**: One-tap copy button with instant feedback state ("Copied!") across both the result banner and individual cards.
- **Two-Step Safe Delete**: Protects against accidental removals with a 3-second confirmation countdown state on the delete button.
- **Accessible & Responsive**: Fully responsive layout optimized for mobile, tablet, and desktop screens with semantic HTML and keyboard accessibility.

---

## Security & Traffic Governance

- **IP-Based Rate Limiting**:
    - `globalLimiter`: Protects all routes against general flooding (200 requests / 15 minutes).
    - `createUrlLimiter`: Limits short URL creation to 10 requests / minute per IP to prevent spam database pollution.
    - `redirectLimiter`: Defends redirect endpoints with 60 requests / minute per IP.
- **Input Sanitization**: Validates that all submitted URLs are strictly valid HTTP/HTTPS web addresses within standard length constraints (max 2048 characters).
- **Favicon Query Isolation**: Prevents browser `GET /favicon.ico` requests from falsely triggering the short code redirection engine.

---

## Code Quality & Formatting

The monorepo contains shared code style standards configured with Prettier and ESLint:

```bash
# Format all files across client, server, and root
npm run format

# Verify formatting without writing changes
npm run format:check
```

Formatting rules are specified in [.prettierrc](file:///.prettierrc):

- Tab Width: `4`
- Quotes: Single (`'`)
- Semicolons: `true`
- Trailing Commas: `es5`
- Bracket Spacing: `true`

---
