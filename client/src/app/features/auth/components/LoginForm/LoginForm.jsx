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
