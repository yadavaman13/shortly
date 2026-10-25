import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import './LoginForm.scss';

// Google SVG icon component
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// Build the Google OAuth URL — points to the Express server directly,
// NOT through the Vite proxy, because this is a full-page redirect
const getGoogleAuthUrl = () => {
    // In production, the API is served from the same origin.
    // In development, we need the full server URL.
    if (import.meta.env.PROD) {
        return '/auth/google';
    }
    return 'http://localhost:3000/auth/google';
};

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

    const handleGoogleSignIn = () => {
        window.location.href = getGoogleAuthUrl();
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
                        placeholder="Enter your email address"
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
                        placeholder="Enter your password"
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

            <div className="auth-divider">
                <span>or</span>
            </div>

            {/* Google OAuth Button */}
            <button
                type="button"
                className="google-btn"
                onClick={handleGoogleSignIn}
            >
                <GoogleIcon />
                <span>Sign in with Google</span>
            </button>
        </form>
    );
};

export default LoginForm;
