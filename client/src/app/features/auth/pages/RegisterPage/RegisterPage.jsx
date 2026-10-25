import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RegisterForm } from '../../components/index.js';
import '../LoginPage/LoginPage.scss';

// Google SVG icon component
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const getGoogleAuthUrl = () => {
    if (import.meta.env.PROD) {
        return '/auth/google';
    }
    return 'http://localhost:3000/auth/google';
};

export const RegisterPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fromState = location.state?.from;
    const from = typeof fromState === 'string'
        ? fromState
        : (fromState?.pathname
            ? `${fromState.pathname}${fromState.search || ''}`
            : '/');

    const handleSuccess = () => {
        navigate(from, { replace: true });
    };

    const handleGoogleSignUp = () => {
        window.location.href = getGoogleAuthUrl();
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Create an account</h1>
                    <p className="auth-subtitle">Start organizing and tracking your shortened links</p>
                </div>

                <RegisterForm onSuccess={handleSuccess} />

                <div className="auth-divider" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.8125rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '1.25rem 0 0.75rem 0',
                }}>
                    <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                    <span>or</span>
                    <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                </div>

                {/* Google OAuth Button */}
                <button
                    type="button"
                    className="google-btn"
                    onClick={handleGoogleSignUp}
                    style={{
                        width: '100%',
                        height: '2.75rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.625rem',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        fontSize: '0.9375rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.625rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background-color 0.15s, border-color 0.15s, transform 0.15s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <GoogleIcon />
                    <span>Sign up with Google</span>
                </button>

                <div className="auth-footer" style={{ marginTop: '1.25rem' }}>
                    <span>Already have an account? </span>
                    <Link to="/login" state={{ from: location.state?.from }}>Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
