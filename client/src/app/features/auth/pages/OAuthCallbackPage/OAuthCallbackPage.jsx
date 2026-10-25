import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export const OAuthCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { checkAuth } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            const success = searchParams.get('success');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError('Google sign-in failed. Please try again.');
                setTimeout(() => navigate('/login', { replace: true }), 2000);
                return;
            }

            if (success === 'true') {
                try {
                    // The JWT cookie was already set by the server redirect.
                    // Re-check auth state to pick up the new session.
                    await checkAuth();
                    navigate('/', { replace: true });
                } catch (err) {
                    setError('Authentication failed. Please try again.');
                    setTimeout(() => navigate('/login', { replace: true }), 2000);
                }
            } else {
                navigate('/login', { replace: true });
            }
        };

        handleCallback();
    }, [searchParams, checkAuth, navigate]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh',
                gap: '1rem',
            }}
        >
            {error ? (
                <p style={{ color: 'var(--error-color)', fontSize: '0.9375rem' }}>{error}</p>
            ) : (
                <>
                    <Loader2 size={32} className="spin" style={{ opacity: 0.6 }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        Completing sign-in...
                    </p>
                </>
            )}
        </div>
    );
};

export default OAuthCallbackPage;
