# Client Authentication & API Contract Design

Date: 2026-10-14
Topic: Client Authentication, API Contract, and Server Alignment

## 1. Overview & Scope

The goal of this system is to provide robust, end-to-end authentication in the URL Shortener application. The server has implemented core authentication controllers and middleware, while the client requires a modular authentication subsystem, dedicated page routing via `react-router-dom`, an isolated API service, state context, and consistent dark/light monochrome styling matching the existing application aesthetic.

In the client, all route definitions and route guards (`ProtectedRoute`, `PublicOnlyRoute`) will reside cleanly in a single `client/src/app.routes.jsx` file.

---

## 2. API Contract Specification

Base URL: `/api/auth` (proxied in Vite to `http://localhost:3000`)
Credentials: All requests use `withCredentials: true` to exchange the `token` cookie.

### 2.1 Register User
- **Route**: `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "aman",
    "email": "aman@example.com",
    "password": "Password123"
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
  - `400 Bad Request`:
    ```json
    {
      "message": "username, email and password are required" | "username already exists" | "user already exists with this email"
    }
    ```
  - `500 Internal Server Error`:
    ```json
    { "message": "Internal Server Error" }
    ```

### 2.2 Login User
- **Route**: `POST /api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "aman@example.com",
    "password": "Password123"
  }
  ```
- **Responses**:
  - `200 OK`:
    - **Header**: `Set-Cookie: token=<jwt_token>; Path=/`
    - **Body**:
      ```json
      {
        "message": "Login successfull",
        "data": {
          "username": "aman",
          "email": "aman@example.com"
        },
        "token": "<jwt_string>"
      }
      ```
  - `400 Bad Request`:
    ```json
    {
      "message": "email and password both are required for login" | "No user exists with this email" | "Entered password is incorrect"
    }
    ```
  - `500 Internal Server Error`:
    ```json
    { "message": "Internal server error" }
    ```

### 2.3 Get Current Authenticated User (`/me`)
- **Route**: `GET /api/auth/me`
- **Cookies**: `token=<jwt_token>` (sent automatically)
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "user fetched successfully",
      "data": {
        "username": "aman",
        "email": "aman@example.com"
      },
      "token": "<jwt_string>"
    }
    ```
  - `401 Unauthorized` / `400 Bad Request`:
    ```json
    { "message": "token not provided" | "invalid token" }
    ```

### 2.4 Logout User
- **Route**: `POST /api/auth/logout`
- **Cookies**: `token=<jwt_token>`
- **Responses**:
  - `200 OK`:
    - **Header**: `Clear-Cookie: token`
    - **Body**:
      ```json
      { "message": "logged out successfully" }
      ```
  - `400 Bad Request`:
    ```json
    { "message": "token is required for logging out" }
    ```

---

## 3. Server-Side Alignment & Fixes

To ensure the contract and runtime stability hold without crashes:
1. **[server/src/middleware/auth.middleware.js](file:///d:/Projects/url-shortner/server/src/middleware/auth.middleware.js)**:
   - Fix ESM import: `import blacklistTokenModel from '../models/blacklist.model.js';` (add `.js`).
   - Use `envConfig.JWT_SECRET` instead of raw `process.env.JWT_SECRET`.
2. **[server/src/modules/auth/controllers/auth.controller.js](file:///d:/Projects/url-shortner/server/src/modules/auth/controllers/auth.controller.js)**:
   - In `getMeController`: wrap `jwt.verify` in `try / catch` so missing/invalid tokens return `401` gracefully instead of throwing unhandled rejections.
   - Also verify that token is not in `blacklistTokenModel` inside `getMeController`.

---

## 4. Client-Side Architecture & Structure

Adhering to **Approach 2 (Strict Feature Isolation)**:

```text
client/src/
├── app.routes.jsx                         # Single file defining AppRoutes, ProtectedRoute & PublicOnlyRoute
├── App.jsx                                # Root app wrapping AuthProvider, UrlProvider, BrowserRouter & AppRoutes
├── App.scss                               # Global styles and layout
├── main.jsx
├── app/
│   ├── components/
│   │   ├── Navbar/                        # Enhanced with user avatar badge and logout
│   │   ├── Footer/
│   │   ├── Toast/
│   │   └── index.js
│   ├── features/
│   │   ├── auth/                          # Isolated Auth Feature
│   │   │   ├── services/
│   │   │   │   └── auth.api.js            # Axios client with withCredentials: true
│   │   │   ├── context/
│   │   │   │   └── authContext.jsx        # AuthProvider & state management
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.js             # Custom hook for easy consumer consumption
│   │   │   │   └── index.js
│   │   │   ├── components/
│   │   │   │   ├── LoginForm/             # LoginForm.jsx + LoginForm.scss
│   │   │   │   ├── RegisterForm/          # RegisterForm.jsx + RegisterForm.scss
│   │   │   │   └── index.js
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage/             # LoginPage.jsx + LoginPage.scss
│   │   │   │   ├── RegisterPage/          # RegisterPage.jsx + RegisterPage.scss
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   └── url/                           # URL management feature (untouched)
│   └── styles/                            # Shared design tokens & mixins
```

### 4.1 Route Strategy (`app.routes.jsx`)
- Single routes module containing:
  - `<ProtectedRoute>`: Checks `isAuthenticated`. If false, navigates to `/login` with `state: { from: location }`. Shows a clean minimal loader while `isLoading`.
  - `<PublicOnlyRoute>`: Checks `isAuthenticated`. If true, navigates to `/`. Shows loader while `isLoading`.
  - `<AppRoutes>`: Defines `<Routes>`:
    - `/`: `<ProtectedRoute><DashboardPage /></ProtectedRoute>` (where `DashboardPage` renders the URL shortener workspace)
    - `/login`: `<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>`
    - `/register`: `<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>`
    - `*`: `<Navigate to="/" replace />`

### 4.2 Styling & Aesthetics
- All forms and pages use the black-and-white minimalist design token system (`--bg-primary`, `--bg-elevated`, `--border-subtle`, `--text-primary`, `--accent-black`, `$font-sans`, `$border-radius-md`).
- Sleek input fields with floating labels or clean focus rings (`--focus-ring`), loading spinners on submit, inline error messages, and seamless dark/light theme switching.
