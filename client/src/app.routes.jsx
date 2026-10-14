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
