import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createQr as apiCreateQr, getAllQrUrls } from '../services/qr.api.js';
import { useUrlContext } from '../../url/context/urlContext.jsx';

const QrContext = createContext(null);

export const QrProvider = ({ children }) => {
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
            if (err?.status === 401 || err?.statusCode === 401 || err?.message === 'token not provided') {
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

    // Load QR URLs on mount
    useEffect(() => {
        fetchQrUrls();
    }, [fetchQrUrls]);

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
                const details = err.details?.map((d) => d.message).join(', ');
                const errorMsg = details || err.error || 'Failed to generate QR code';
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
