import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createQr as apiCreateQr, getAllQrUrls } from '../services/qr.api.js';
import { useUrlContext } from '../../url/context/urlContext.jsx';
import { useAuth } from '../../auth/hooks/useAuth.js';

const QrContext = createContext(null);

export const QrProvider = ({ children }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [currentQr, setCurrentQr] = useState(null);
    const [qrUrls, setQrUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Optional integration with shared UrlContext for unified toast notifications and list syncing
    let urlContext = null;
    try {
        urlContext = useUrlContext();
    } catch {
        // Safe fallback if QrProvider is mounted outside UrlProvider
    }

    const showToast = useCallback((msg, type = 'info') => {
        if (urlContext?.showToast) {
            urlContext.showToast(msg, type);
        }
    }, [urlContext]);

    // Fetch all QR URLs
    const fetchQrUrls = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllQrUrls();
            const list = response?.data?.urls || response?.urls || [];
            setQrUrls(list);
        } catch (err) {
            if (
                err?.status === 401 ||
                err?.statusCode === 401 ||
                err?.message === 'token not provided' ||
                err?.error?.includes('Unauthorized')
            ) {
                setQrUrls([]);
                return;
            }
            console.error('Failed to fetch QR URLs:', err);
            const msg = err.error || err.message || 'Failed to fetch QR URLs';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load / sync QR URLs when auth status updates
    useEffect(() => {
        if (authLoading) return;

        if (isAuthenticated) {
            fetchQrUrls();
        } else {
            setQrUrls([]);
            setCurrentQr(null);
            setError(null);
            setLoading(false);
        }
    }, [isAuthenticated, authLoading, fetchQrUrls]);

    // Generate QR action
    const generateQr = useCallback(
        async (url) => {
            try {
                setSubmitting(true);
                setError(null);
                const result = await apiCreateQr({ url });
                const qrData = result?.data || result;

                if (qrData) {
                    setCurrentQr(qrData);

                    // Add to local qrUrls list
                    setQrUrls((prev) => [
                        {
                            _id: qrData.id || qrData._id,
                            originalUrl: qrData.originalUrl,
                            shortUrl: qrData.shortUrl,
                            qrGenerated: true,
                            clicks: qrData.clicks ?? 0,
                            qrScans: qrData.qrScans ?? 0,
                            createdAt: qrData.createdAt || new Date().toISOString(),
                        },
                        ...prev.filter(
                            (u) =>
                                (u._id || u.id) !== (qrData.id || qrData._id) &&
                                u.shortUrl !== qrData.shortUrl,
                        ),
                    ]);

                    // Also refresh or sync URL context list if available
                    if (urlContext?.fetchUrls) {
                        urlContext.fetchUrls();
                    }

                    showToast('QR Code generated successfully', 'success');
                }
                return qrData;
            } catch (err) {
                console.error('Failed to generate QR code:', err);
                let errorMsg =
                    (err?.details ? err.details.map((d) => d.message).join(', ') : err?.error) ||
                    err?.message ||
                    'Failed to generate QR code';
                if (err.status === 401 || err.statusCode === 401 || errorMsg === 'token not provided') {
                    errorMsg = 'Please sign in or register to generate QR codes';
                }
                setError(errorMsg);
                showToast(errorMsg, 'error');
                throw err;
            } finally {
                setSubmitting(false);
            }
        },
        [showToast, urlContext],
    );

    // Update destination for a QR URL in state
    const updateQrDestination = useCallback((id, updatedData) => {
        setQrUrls((prev) =>
            prev.map((item) => {
                const match = (item._id || item.id) === id || item.shortUrl === id;
                return match ? { ...item, ...updatedData } : item;
            }),
        );
        if (currentQr && ((currentQr.id || currentQr._id) === id || currentQr.shortUrl === id)) {
            setCurrentQr((prev) => ({ ...prev, ...updatedData }));
        }
    }, [currentQr]);

    const clearCurrentQr = useCallback(() => setCurrentQr(null), []);
    const clearError = useCallback(() => setError(null), []);

    const value = {
        currentQr,
        setCurrentQr,
        clearCurrentQr,
        qrUrls,
        setQrUrls,
        loading,
        submitting,
        error,
        setError,
        clearError,
        fetchQrUrls,
        generateQr,
        updateQrDestination,
    };

    return <QrContext.Provider value={value}>{children}</QrContext.Provider>;
};

export const useQrContext = () => {
    const context = useContext(QrContext);
    if (!context) {
        throw new Error('useQrContext must be used within a QrProvider');
    }
    return context;
};

export default QrContext;
