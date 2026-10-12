import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    getAllUrls,
    createShortenUrl as apiCreateShortenUrl,
    deleteUrl as apiDeleteUrl,
} from '../services/url.api.js';

const UrlContext = createContext(null);

export const UrlProvider = ({ children }) => {
    const [urls, setUrls] = useState([]);
    const [currentUrl, setCurrentUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    // Toast auto-dismissal helper
    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type, id: Date.now() });
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => {
            setToast(null);
        }, 3500);
        return () => clearTimeout(timer);
    }, [toast]);

    // Fetch all URLs
    const fetchUrls = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllUrls();
            const list = response?.data?.urls || response?.urls || [];
            setUrls(list);
        } catch (err) {
            console.error('Failed to fetch URLs:', err);
            const msg = err.error || err.message || 'Failed to fetch URLs';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load URLs on initial mount
    useEffect(() => {
        fetchUrls();
    }, [fetchUrls]);

    // Shorten URL action
    const shortenUrl = useCallback(
        async (payload) => {
            try {
                setSubmitting(true);
                setError(null);
                const result = await apiCreateShortenUrl(payload);
                const newRecord = result?.data || result;

                if (newRecord) {
                    setCurrentUrl(newRecord);
                    // Prepend new URL or update list
                    setUrls((prev) => [
                        {
                            _id: newRecord.id || newRecord._id,
                            originalUrl: newRecord.originalUrl,
                            shortUrl: newRecord.shortUrl,
                            clicks: newRecord.clicks ?? 0,
                            createdAt: newRecord.createdAt || new Date().toISOString(),
                        },
                        ...prev.filter(
                            (u) =>
                                (u._id || u.id) !== (newRecord.id || newRecord._id) &&
                                u.shortUrl !== newRecord.shortUrl,
                        ),
                    ]);
                    showToast('Short URL generated successfully', 'success');
                }
                return newRecord;
            } catch (err) {
                console.error('Failed to create short URL:', err);
                const details = err.details?.map((d) => d.message).join(', ');
                const errorMsg = details || err.error || 'Failed to shorten URL';
                setError(errorMsg);
                showToast(errorMsg, 'error');
                throw err;
            } finally {
                setSubmitting(false);
            }
        },
        [showToast],
    );

    // Delete URL action
    const removeUrl = useCallback(
        async (id) => {
            try {
                setDeletingId(id);
                setError(null);
                await apiDeleteUrl(id);
                setUrls((prev) =>
                    prev.filter((item) => (item._id || item.id) !== id && item.shortUrl !== id),
                );
                if (
                    currentUrl &&
                    (currentUrl._id === id || currentUrl.id === id || currentUrl.shortUrl === id)
                ) {
                    setCurrentUrl(null);
                }
                showToast('URL deleted successfully', 'success');
            } catch (err) {
                console.error('Failed to delete URL:', err);
                const msg = err.error || 'Failed to delete URL';
                setError(msg);
                showToast(msg, 'error');
                throw err;
            } finally {
                setDeletingId(null);
            }
        },
        [currentUrl, showToast],
    );

    const clearError = useCallback(() => setError(null), []);
    const clearCurrentUrl = useCallback(() => setCurrentUrl(null), []);

    const value = {
        urls,
        setUrls,
        currentUrl,
        setCurrentUrl,
        clearCurrentUrl,
        loading,
        submitting,
        deletingId,
        error,
        setError,
        clearError,
        toast,
        showToast,
        fetchUrls,
        shortenUrl,
        removeUrl,
    };

    return <UrlContext.Provider value={value}>{children}</UrlContext.Provider>;
};

// Also export urlProvider with lowercase to preserve backwards compatibility if imported anywhere
export const urlProvider = UrlProvider;

export const useUrlContext = () => {
    const context = useContext(UrlContext);
    if (!context) {
        throw new Error('useUrlContext must be used within a UrlProvider');
    }
    return context;
};

export default UrlContext;
