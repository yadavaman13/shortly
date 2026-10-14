# Client Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete, modular client-side authentication system with React Router, dedicated login/register pages, isolated auth service & context, a single `app.routes.jsx` routing module, consistent black-and-white minimalist styling, and necessary server-side stabilization fixes.

**Architecture:** Approach 2 (Strict Feature Isolation). Features live in `src/app/features/auth` mirroring `src/app/features/url`. Authentication API calls use an isolated Axios instance with `withCredentials: true`. Session persistence is managed through `AuthContext` via `/api/auth/me`. All routes and route guards are centralized into a single `src/app.routes.jsx`.

**Tech Stack:** React 19, React Router DOM v7+, Axios, Sass, Lucide React, Express 5, JWT, Mongoose.

**Spec:** [docs/superpowers/specs/2026-10-14-client-auth-design.md](file:///d:/Projects/url-shortner/docs/superpowers/specs/2026-10-14-client-auth-design.md)

## Global Constraints

- Preserve all existing styling tokens in `src/styles/_variables.scss` and mixins in `_mixins.scss`.
- Route guards and route definitions must live together in a single `client/src/app.routes.jsx`.
- Auth API instance must be separate in `src/app/features/auth/services/auth.api.js` with `withCredentials: true`.
- Zero placeholder code (no `TODO`, `TBD`, or unimplemented handlers).
- Every task must be verified with testing or runtime check before proceeding.

---

### Task 1: Server Alignment & Middleware Stabilization

**Files:**
- Modify: `server/src/middleware/auth.middleware.js:1-35`
- Modify: `server/src/modules/auth/controllers/auth.controller.js:125-151`

**Interfaces:**
- Consumes: `blacklistTokenModel`, `envConfig`, `jwt`, `userModel`
- Produces: Reliable `/api/auth/me` and `authUser` middleware that returns `401` without crashing on missing or invalid tokens.

- [ ] **Step 1: Fix ESM import extension and JWT secret in auth.middleware.js**

Update `server/src/middleware/auth.middleware.js`:
```javascript
import jwt from 'jsonwebtoken';
import blacklistTokenModel from '../models/blacklist.model.js';
import envConfig from '../config/env.config.js';

export async function authUser(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: 'token not provided',
        });
    }

    try {
        const isTokenBlacklisted = await blacklistTokenModel.findOne({
            token,
        });

        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: 'token is invalid',
            });
        }

        const decoded = jwt.verify(token, envConfig.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Invalid token',
        });
    }
}
```

- [ ] **Step 2: Add try/catch and blacklist check to getMeController**

Update `getMeController` in `server/src/modules/auth/controllers/auth.controller.js`:
```javascript
export async function getMeController(req, res) {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: 'token not provided',
            });
        }

        const isTokenBlacklisted = await blacklistTokenModel.findOne({ token });
        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: 'invalid token',
            });
        }

        const decoded = jwt.verify(token, envConfig.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({
                message: 'invalid token',
            });
        }

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                message: 'user not found',
            });
        }

        return res.status(200).json({
            message: 'user fetched successfully',
            data: {
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        return res.status(401).json({
            message: 'invalid or expired token',
        });
    }
}
```

- [ ] **Step 3: Verify server boots and syntax is valid**

Run:
```powershell
node --check server/src/middleware/auth.middleware.js
node --check server/src/modules/auth/controllers/auth.controller.js
```
Expected: Clean exit code 0 without any syntax or import errors.

- [ ] **Step 4: Commit server alignment changes**

```powershell
git add server/src/middleware/auth.middleware.js server/src/modules/auth/controllers/auth.controller.js
git commit -m "fix(server): resolve auth middleware ESM import and add getMe error handling"
```

---

### Task 2: Install React Router DOM in Client

**Files:**
- Modify: `client/package.json`

**Interfaces:**
- Consumes: NPM package registry
- Produces: `react-router-dom` available for import in client application.

- [ ] **Step 1: Install `react-router-dom` in client**

Run:
```powershell
npm install react-router-dom --prefix client
```
Expected: `react-router-dom` installed in `client/package.json` dependencies.

- [ ] **Step 2: Verify installation**

Run:
```powershell
node -e "require.resolve('react-router-dom', { paths: ['client'] })"
```
Expected: Path to `react-router-dom` resolved successfully.

- [ ] **Step 3: Commit package dependency**

```powershell
git add client/package.json client/package-lock.json
git commit -m "chore(client): install react-router-dom"
```

---

### Task 3: Client Auth API Service

**Files:**
- Create: `client/src/app/features/auth/services/auth.api.js`

**Interfaces:**
- Consumes: `/api/auth` endpoints
- Produces:
  - `registerUser({ username, email, password }) -> Promise<object>`
  - `loginUser({ email, password }) -> Promise<object>`
  - `logoutUser() -> Promise<object>`
  - `getMe() -> Promise<object>`

- [ ] **Step 1: Create auth.api.js**

Write `client/src/app/features/auth/services/auth.api.js`:
```javascript
import axios from 'axios';

const authApiInstance = axios.create({
    baseURL: '/api/auth',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Registers a new user
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {Promise<object>}
 */
export async function registerUser(payload) {
    try {
        const response = await authApiInstance.post('/register', payload);
        return response.data;
    } catch (err) {
        console.error('Error in registerUser:', err);
        throw err.response?.data || { message: err.message || 'Registration failed' };
    }
}

/**
 * Logs in an existing user and sets session cookie
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<object>}
 */
export async function loginUser(payload) {
    try {
        const response = await authApiInstance.post('/login', payload);
        return response.data;
    } catch (err) {
        console.error('Error in loginUser:', err);
        throw err.response?.data || { message: err.message || 'Login failed' };
    }
}

/**
 * Logs out user, invalidating session and clearing cookie
 * @returns {Promise<object>}
 */
export async function logoutUser() {
    try {
        const response = await authApiInstance.post('/logout');
        return response.data;
    } catch (err) {
        console.error('Error in logoutUser:', err);
        throw err.response?.data || { message: err.message || 'Logout failed' };
    }
}

/**
 * Fetches current authenticated user profile
 * @returns {Promise<object>}
 */
export async function getMe() {
    try {
        const response = await authApiInstance.get('/me');
        return response.data;
    } catch (err) {
        if (err.response?.status !== 401 && err.response?.status !== 400) {
            console.error('Error in getMe:', err);
        }
        throw err.response?.data || { message: err.message || 'Failed to authenticate' };
    }
}
```

- [ ] **Step 2: Commit Auth API Service**

```powershell
git add client/src/app/features/auth/services/auth.api.js
git commit -m "feat(client): implement auth.api.js service"
```

---

### Task 4: Client Auth Context and useAuth Hook

**Files:**
- Create: `client/src/app/features/auth/context/authContext.jsx`
- Create: `client/src/app/features/auth/hooks/useAuth.js`
- Create: `client/src/app/features/auth/hooks/index.js`

**Interfaces:**
- Consumes: `auth.api.js`
- Produces: `AuthProvider`, `useAuthContext`, `useAuth` hook exporting `{ user, isAuthenticated, loading, login, register, logout, checkAuth }`

- [ ] **Step 1: Create authContext.jsx**

Write `client/src/app/features/auth/context/authContext.jsx`:
```jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    loginUser as apiLoginUser,
    registerUser as apiRegisterUser,
    logoutUser as apiLogoutUser,
    getMe as apiGetMe,
} from '../services/auth.api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiGetMe();
            const userData = response?.data || null;
            setUser(userData);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (credentials) => {
        try {
            setError(null);
            const response = await apiLoginUser(credentials);
            const userData = response?.data || { email: credentials.email };
            setUser(userData);
            return response;
        } catch (err) {
            const msg = err.message || 'Login failed';
            setError(msg);
            throw err;
        }
    }, []);

    const register = useCallback(async (payload) => {
        try {
            setError(null);
            const response = await apiRegisterUser(payload);
            return response;
        } catch (err) {
            const msg = err.message || 'Registration failed';
            setError(msg);
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setError(null);
            await apiLogoutUser();
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setUser(null);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        error,
        clearError,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
```

- [ ] **Step 2: Create useAuth.js and index.js**

Write `client/src/app/features/auth/hooks/useAuth.js`:
```javascript
import { useAuthContext } from '../context/authContext.jsx';

export const useAuth = () => {
    return useAuthContext();
};

export default useAuth;
```

Write `client/src/app/features/auth/hooks/index.js`:
```javascript
export { useAuth } from './useAuth.js';
```

- [ ] **Step 3: Commit Auth Context and Hook**

```powershell
git add client/src/app/features/auth/context/authContext.jsx client/src/app/features/auth/hooks/
git commit -m "feat(client): implement authContext and useAuth hook"
```

---

### Task 5: Client Auth UI Forms (LoginForm & RegisterForm)

**Files:**
- Create: `client/src/app/features/auth/components/LoginForm/LoginForm.jsx`
- Create: `client/src/app/features/auth/components/LoginForm/LoginForm.scss`
- Create: `client/src/app/features/auth/components/RegisterForm/RegisterForm.jsx`
- Create: `client/src/app/features/auth/components/RegisterForm/RegisterForm.scss`
- Create: `client/src/app/features/auth/components/index.js`

**Interfaces:**
- Consumes: `useAuth`, `lucide-react` icons, Sass design tokens
- Produces: `LoginForm` and `RegisterForm` form components.

- [ ] **Step 1: Create LoginForm component and styling**

Write `client/src/app/features/auth/components/LoginForm/LoginForm.scss`:
```scss
@use '../../../../../styles/variables' as *;
@use '../../../../../styles/mixins' as *;

.auth-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .input-wrap {
            position: relative;
            display: flex;
            align-items: center;

            .input-icon {
                position: absolute;
                left: 0.875rem;
                color: var(--text-muted);
                pointer-events: none;
            }

            input {
                width: 100%;
                height: 2.75rem;
                padding: 0 0.875rem 0 2.5rem;
                background-color: var(--bg-tertiary);
                border: 1px solid var(--border-subtle);
                border-radius: $border-radius-md;
                color: var(--text-primary);
                font-family: inherit;
                font-size: 0.9375rem;
                transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

                &::placeholder {
                    color: var(--text-subtle);
                }

                &:focus {
                    outline: none;
                    border-color: var(--border-strong);
                    box-shadow: var(--focus-ring);
                }
            }

            .toggle-password {
                @include button-reset;
                position: absolute;
                right: 0.875rem;
                color: var(--text-muted);
                display: flex;
                align-items: center;

                &:hover {
                    color: var(--text-primary);
                }
            }
        }
    }

    .form-error {
        padding: 0.75rem 1rem;
        background-color: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.25);
        border-radius: $border-radius-md;
        color: #ef4444;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .submit-btn {
        @include button-reset;
        width: 100%;
        height: 2.75rem;
        background-color: var(--accent-black);
        color: var(--accent-white);
        border-radius: $border-radius-md;
        font-weight: 600;
        font-size: 0.9375rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: opacity var(--transition-fast), transform var(--transition-fast);

        &:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        &:active:not(:disabled) {
            transform: translateY(0);
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
}
```

Write `client/src/app/features/auth/components/LoginForm/LoginForm.jsx`:
```jsx
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import './LoginForm.scss';

export const LoginForm = ({ onSuccess }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (errorMsg) setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setErrorMsg('Email and password are required');
            return;
        }

        try {
            setSubmitting(true);
            setErrorMsg('');
            await login(formData);
            if (onSuccess) onSuccess();
        } catch (err) {
            setErrorMsg(err.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            {errorMsg && (
                <div className="form-error" role="alert">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <div className="input-wrap">
                    <Mail size={16} className="input-icon" />
                    <input
                        id="login-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        disabled={submitting}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-wrap">
                    <Lock size={16} className="input-icon" />
                    <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        disabled={submitting}
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex="-1"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (
                    <>
                        <Loader2 size={16} className="spin" />
                        <span>Signing in...</span>
                    </>
                ) : (
                    <span>Sign In</span>
                )}
            </button>
        </form>
    );
};

export default LoginForm;
```

- [ ] **Step 2: Create RegisterForm component and styling**

Write `client/src/app/features/auth/components/RegisterForm/RegisterForm.scss`:
```scss
@use '../../../../../styles/variables' as *;
@use '../../../../../styles/mixins' as *;

// Reuses the identical minimal classes as LoginForm
```

Write `client/src/app/features/auth/components/RegisterForm/RegisterForm.jsx`:
```jsx
import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import '../LoginForm/LoginForm.scss';

export const RegisterForm = ({ onSuccess }) => {
    const { register, login } = useAuth();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (errorMsg) setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.email || !formData.password) {
            setErrorMsg('All fields are required');
            return;
        }

        try {
            setSubmitting(true);
            setErrorMsg('');
            await register(formData);
            // Automatically log the user in after registration
            await login({ email: formData.email, password: formData.password });
            if (onSuccess) onSuccess();
        } catch (err) {
            setErrorMsg(err.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            {errorMsg && (
                <div className="form-error" role="alert">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="reg-username">Username</label>
                <div className="input-wrap">
                    <User size={16} className="input-icon" />
                    <input
                        id="reg-username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="johndoe"
                        autoComplete="username"
                        required
                        disabled={submitting}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <div className="input-wrap">
                    <Mail size={16} className="input-icon" />
                    <input
                        id="reg-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        disabled={submitting}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-wrap">
                    <Lock size={16} className="input-icon" />
                    <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        disabled={submitting}
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex="-1"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (
                    <>
                        <Loader2 size={16} className="spin" />
                        <span>Creating account...</span>
                    </>
                ) : (
                    <span>Create Account</span>
                )}
            </button>
        </form>
    );
};

export default RegisterForm;
```

Write `client/src/app/features/auth/components/index.js`:
```javascript
export { LoginForm } from './LoginForm/LoginForm.jsx';
export { RegisterForm } from './RegisterForm/RegisterForm.jsx';
```

- [ ] **Step 3: Commit Auth Forms**

```powershell
git add client/src/app/features/auth/components/
git commit -m "feat(client): implement LoginForm and RegisterForm components"
```

---

### Task 6: Client Auth Pages (LoginPage & RegisterPage)

**Files:**
- Create: `client/src/app/features/auth/pages/LoginPage/LoginPage.jsx`
- Create: `client/src/app/features/auth/pages/LoginPage/LoginPage.scss`
- Create: `client/src/app/features/auth/pages/RegisterPage/RegisterPage.jsx`
- Create: `client/src/app/features/auth/pages/RegisterPage/RegisterPage.scss`
- Create: `client/src/app/features/auth/pages/index.js`
- Create: `client/src/app/features/auth/index.js`

**Interfaces:**
- Consumes: `LoginForm`, `RegisterForm`, `Link` from `react-router-dom`
- Produces: `LoginPage`, `RegisterPage`

- [ ] **Step 1: Create LoginPage component and styling**

Write `client/src/app/features/auth/pages/LoginPage/LoginPage.scss`:
```scss
@use '../../../../../styles/variables' as *;
@use '../../../../../styles/mixins' as *;

.auth-page-container {
    min-height: calc(100vh - 140px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;

    .auth-card {
        @include card-surface;
        width: 100%;
        max-width: 420px;
        padding: 2.25rem 2rem;
        box-shadow: var(--card-shadow);

        .auth-header {
            text-align: center;
            margin-bottom: 2rem;

            .auth-title {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 0.5rem;
                letter-spacing: -0.02em;
            }

            .auth-subtitle {
                font-size: 0.875rem;
                color: var(--text-muted);
            }
        }

        .auth-footer {
            margin-top: 1.75rem;
            text-align: center;
            font-size: 0.875rem;
            color: var(--text-muted);

            a {
                color: var(--text-primary);
                font-weight: 600;
                text-decoration: underline;
                text-underline-offset: 3px;
                transition: opacity var(--transition-fast);

                &:hover {
                    opacity: 0.8;
                }
            }
        }
    }
}
```

Write `client/src/app/features/auth/pages/LoginPage/LoginPage.jsx`:
```jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../components/index.js';
import './LoginPage.scss';

export const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleSuccess = () => {
        navigate(from, { replace: true });
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Enter your credentials to access your shortened links</p>
                </div>

                <LoginForm onSuccess={handleSuccess} />

                <div className="auth-footer">
                    <span>Don&apos;t have an account? </span>
                    <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
```

- [ ] **Step 2: Create RegisterPage component and styling**

Write `client/src/app/features/auth/pages/RegisterPage/RegisterPage.scss`:
```scss
@use '../../../../../styles/variables' as *;
@use '../../../../../styles/mixins' as *;

// Reuses .auth-page-container from LoginPage.scss
```

Write `client/src/app/features/auth/pages/RegisterPage/RegisterPage.jsx`:
```jsx
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../components/index.js';
import '../LoginPage/LoginPage.scss';

export const RegisterPage = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate('/', { replace: true });
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Create an account</h1>
                    <p className="auth-subtitle">Start organizing and tracking your shortened links</p>
                </div>

                <RegisterForm onSuccess={handleSuccess} />

                <div className="auth-footer">
                    <span>Already have an account? </span>
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
```

Write `client/src/app/features/auth/pages/index.js`:
```javascript
export { LoginPage } from './LoginPage/LoginPage.jsx';
export { RegisterPage } from './RegisterPage/RegisterPage.jsx';
```

Write `client/src/app/features/auth/index.js`:
```javascript
export * from './context/authContext.jsx';
export * from './hooks/index.js';
export * from './components/index.js';
export * from './pages/index.js';
export * from './services/auth.api.js';
```

- [ ] **Step 3: Commit Auth Pages**

```powershell
git add client/src/app/features/auth/pages/ client/src/app/features/auth/index.js
git commit -m "feat(client): implement LoginPage and RegisterPage"
```

---

### Task 7: Single Client Routes Module (`app.routes.jsx`)

**Files:**
- Create: `client/src/app.routes.jsx`

**Interfaces:**
- Consumes: `useAuth`, `LoginPage`, `RegisterPage`, `react-router-dom`
- Produces: `AppRoutes` default export, encapsulating `<ProtectedRoute>`, `<PublicOnlyRoute>`, and all `<Route>` mappings.

- [ ] **Step 1: Write client/src/app.routes.jsx**

Write `client/src/app.routes.jsx`:
```jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './app/features/auth/hooks/useAuth.js';
import { LoginPage, RegisterPage } from './app/features/auth/pages/index.js';
import { UrlStats, UrlForm, UrlResult, UrlList } from './app/features/url/components/index.js';
import { Loader2 } from 'lucide-react';

/**
 * Route guard for routes that require authentication
 */
export function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Loader2 size={32} className="spin" style={{ opacity: 0.6 }} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

/**
 * Route guard for guest-only routes (login, register)
 */
export function PublicOnlyRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Loader2 size={32} className="spin" style={{ opacity: 0.6 }} />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

/**
 * Main dashboard view for authenticated users
 */
function DashboardView() {
    return (
        <main className="main-content">
            <section className="hero-section">
                <h1 className="hero-title">
                    Tired of sharing <span className="highlight">long, messy links</span>?
                </h1>
                <p className="hero-description">
                    Turn them into short, clean links you can share anywhere. Track clicks and
                    keep your links simple, all in one place.
                </p>
            </section>

            <UrlStats />
            <UrlForm />
            <UrlResult />
            <UrlList />
        </main>
    );
}

/**
 * Central routing configuration
 */
export default function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardView />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/login"
                element={
                    <PublicOnlyRoute>
                        <LoginPage />
                    </PublicOnlyRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicOnlyRoute>
                        <RegisterPage />
                    </PublicOnlyRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
```

- [ ] **Step 2: Commit app.routes.jsx**

```powershell
git add client/src/app.routes.jsx
git commit -m "feat(client): implement single app.routes.jsx with route guards"
```

---

### Task 8: Update Navbar with User Profile & Logout

**Files:**
- Modify: `client/src/app/components/Navbar/Navbar.jsx:1-71`
- Modify: `client/src/app/components/Navbar/Navbar.scss`

**Interfaces:**
- Consumes: `useAuth` hook, `useNavigate`
- Produces: Navbar displaying username badge, avatar initials, and logout button when authenticated, or "Sign In" link when guest.

- [ ] **Step 1: Update Navbar.scss**

Add styling to `client/src/app/components/Navbar/Navbar.scss`:
```scss
// User badge in navbar
.user-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.65rem;
    background-color: var(--badge-bg);
    border: 1px solid var(--badge-border);
    border-radius: $border-radius-full;
    font-size: 0.8125rem;
    color: var(--badge-text);
    font-weight: 500;

    .user-avatar {
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 50%;
        background-color: var(--accent-black);
        color: var(--accent-white);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
    }
}
```

- [ ] **Step 2: Update Navbar.jsx**

Update `client/src/app/components/Navbar/Navbar.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import './Navbar.scss';

const GithubIcon = ({ size = 15, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        {...props}
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
    </svg>
);

export const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('shortly-theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('shortly-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <header className="app-navbar">
            <div className="navbar-inner">
                <div className="brand-wrap">
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <span className="brand-text">Url Shortner</span>
                    </Link>
                </div>

                <div className="navbar-right">
                    {isAuthenticated && user && (
                        <div className="user-badge" title={`Logged in as ${user.username}`}>
                            <span className="user-avatar">{initial}</span>
                            <span className="user-name">{user.username}</span>
                        </div>
                    )}

                    <button
                        type="button"
                        className="nav-btn"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>

                    {isAuthenticated ? (
                        <button
                            type="button"
                            className="nav-btn"
                            onClick={handleLogout}
                            title="Sign out of your account"
                            aria-label="Logout"
                        >
                            <LogOut size={15} />
                            <span>Logout</span>
                        </button>
                    ) : (
                        <Link to="/login" className="nav-btn" title="Sign In">
                            <User size={15} />
                            <span>Sign In</span>
                        </Link>
                    )}

                    <a
                        href="https://github.com/yadavaman13/shortly"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-btn"
                        title="GitHub Repository"
                    >
                        <GithubIcon size={15} />
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
```

- [ ] **Step 3: Commit Navbar updates**

```powershell
git add client/src/app/components/Navbar/
git commit -m "feat(client): update Navbar with user avatar, username and logout button"
```

---

### Task 9: Assemble Client Root and Sync UrlProvider

**Files:**
- Modify: `client/src/App.jsx:1-48`
- Modify: `client/src/app/features/url/context/urlContext.jsx:32-53`

**Interfaces:**
- Consumes: `BrowserRouter`, `AuthProvider`, `UrlProvider`, `AppRoutes`
- Produces: Unified application root with smooth session bootstrapping.

- [ ] **Step 1: Guard URL fetching when unauthenticated in urlContext.jsx**

In `client/src/app/features/url/context/urlContext.jsx`, ensure `fetchUrls()` doesn't fire if the user is unauthenticated:
```jsx
// Fetch all URLs
const fetchUrls = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const response = await getAllUrls();
        const list = response?.data?.urls || response?.urls || [];
        setUrls(list);
    } catch (err) {
        // If 401 unauthenticated, clear the list quietly without noisy errors
        if (err.status === 401 || err.statusCode === 401) {
            setUrls([]);
            return;
        }
        console.error('Failed to fetch URLs:', err);
        const msg = err.error || err.message || 'Failed to fetch URLs';
        setError(msg);
    } finally {
        setLoading(false);
    }
}, []);
```

- [ ] **Step 2: Update App.jsx**

Update `client/src/App.jsx`:
```jsx
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/features/auth/context/authContext.jsx';
import { UrlProvider } from './app/features/url/context/urlContext.jsx';
import { Navbar, Toast, Footer } from './app/components/index.js';
import AppRoutes from './app.routes.jsx';
import './App.scss';

function AppLayout() {
    return (
        <div className="app-container">
            <div className="app-bg-grid" aria-hidden="true" />
            <Navbar />
            <AppRoutes />
            <Footer />
            <Toast />
        </div>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <UrlProvider>
                    <AppLayout />
                </UrlProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
```

- [ ] **Step 3: Commit App assembly**

```powershell
git add client/src/App.jsx client/src/app/features/url/context/urlContext.jsx
git commit -m "feat(client): assemble providers, routes and layout in App.jsx"
```

---

### Task 10: Build & Integration Verification

**Files:**
- Test all client and server components

- [ ] **Step 1: Run Vite build check**

Run:
```powershell
npm run build --prefix client
```
Expected: `vite build` completes successfully without bundle or syntax errors.

- [ ] **Step 2: Verify End-to-End User Flow**

1. Visit `http://localhost:5173/` in the browser -> verify redirect to `/login`.
2. Click "Create one" -> verify navigation to `/register`.
3. Register a test user -> verify auto-login, redirection to `/`, and display of user badge in Navbar.
4. Shorten a link -> verify link is created and rendered in the list.
5. Click "Logout" -> verify session is cleared and redirected back to `/login`.
6. Try visiting `/` again -> verify guarded redirect back to `/login`.

- [ ] **Step 3: Commit all verified work**

```powershell
git status
git commit -am "chore: complete end-to-end authentication implementation and verification"
```
