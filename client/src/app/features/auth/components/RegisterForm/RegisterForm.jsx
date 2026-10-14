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

        if (formData.password.length < 8) {
            setErrorMsg('Password must be at least 8 characters long');
            return;
        }

        try {
            setSubmitting(true);
            setErrorMsg('');
            await register(formData);
            // Automatically log in after successful registration
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
                        placeholder="At least 8 characters"
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
