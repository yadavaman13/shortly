import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RegisterForm } from '../../components/index.js';
import '../LoginPage/LoginPage.scss';

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
                    <Link to="/login" state={{ from: location.state?.from }}>Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
