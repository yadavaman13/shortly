import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './app/features/auth/hooks/useAuth.js';
import { LoginPage, RegisterPage } from './app/features/auth/pages/index.js';
import { MainDashboard } from './app/pages/MainDashboard/MainDashboard.jsx';
import { Loader2 } from 'lucide-react';

/**
 * Route guard for routes that strictly require authentication
 */
export function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh',
                }}
            >
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
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh',
                }}
            >
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
 * Central routing configuration
 */
export default function AppRoutes() {
    return (
        <Routes>
            {/* Unified Main Dashboard matching the blueprint layout */}
            <Route path="/" element={<MainDashboard />} />
            {/* Redirect /qr to unified dashboard with tab preset */}
            <Route path="/qr" element={<Navigate to="/?tab=qr" replace />} />

            {/* Authentication Routes */}
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
