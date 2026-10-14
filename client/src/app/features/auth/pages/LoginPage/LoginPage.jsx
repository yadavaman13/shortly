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
