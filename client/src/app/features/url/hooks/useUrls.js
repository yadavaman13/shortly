import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUrlContext } from '../context/urlContext.jsx';
import { searchUrls } from '../services/url.api.js';
import { useDebounce } from './useDebounce.js';

/**
 * Custom hook to interact with URL collection, computed statistics, and debounced search API
 */
export function useUrls() {
    const {
        urls,
        loading,
        submitting,
        deletingId,
        error,
        clearError,
        fetchUrls,
        shortenUrl,
        removeUrl,
        currentUrl,
        clearCurrentUrl,
    } = useUrlContext();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Debounce value hook (500ms)
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Computed statistics based on the full URL list
    const stats = useMemo(() => {
        const totalUrls = urls.length;
        const totalClicks = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
        const topUrl = urls.length
            ? [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0]
            : null;

        return {
            totalUrls,
            totalClicks,
            topUrl,
        };
    }, [urls]);

    // Fast-clear search state when input is cleared directly
    const handleSetSearchQuery = useCallback((query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults(null);
            setIsSearching(false);
            setSearchError(null);
        }
    }, []);

    // Perform debounced API search: cancels previous in-flight requests and waits 500ms after last keystroke
    useEffect(() => {
        const trimmed = searchQuery.trim();

        if (!trimmed) {
            setSearchResults(null);
            setIsSearching(false);
            setSearchError(null);
            return;
        }

        setIsSearching(true);
        const abortController = new AbortController();

        const timer = setTimeout(async () => {
            try {
                const res = await searchUrls(trimmed, {
                    signal: abortController.signal,
                });
                const results = res?.data?.urls || res?.urls || [];
                setSearchResults(results);
                setSearchError(null);
            } catch (err) {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                    return; // Request was superseded
                }
                console.error('Search API error:', err);
                setSearchError(err.error || 'Failed to search URLs');
                setSearchResults([]);
            } finally {
                if (!abortController.signal.aborted) {
                    setIsSearching(false);
                }
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            abortController.abort();
        };
    }, [searchQuery]);

    // Handle delete action: delete from context and sync active search results
    const handleRemoveUrl = useCallback(
        async (id) => {
            if (searchResults) {
                setSearchResults((prev) =>
                    prev ? prev.filter((u) => (u._id || u.id) !== id && u.shortUrl !== id) : null,
                );
            }
            return removeUrl(id);
        },
        [removeUrl, searchResults],
    );

    // Active displayed URLs: API search results when query is active, otherwise context list
    const displayedUrls = useMemo(() => {
        if (!searchQuery.trim()) {
            return urls;
        }
        if (searchResults !== null) {
            return searchResults;
        }
        // Optimistic local filtering while debounced search is queued
        const query = searchQuery.toLowerCase().trim();
        return urls.filter(
            (u) =>
                u.shortUrl?.toLowerCase().includes(query) ||
                u.originalUrl?.toLowerCase().includes(query),
        );
    }, [searchQuery, searchResults, urls]);

    return {
        urls: displayedUrls,
        allUrls: urls,
        stats,
        searchQuery,
        setSearchQuery: handleSetSearchQuery,
        debouncedSearchQuery,
        isSearching,
        searchError,
        loading: loading || isSearching,
        submitting,
        deletingId,
        error: error || searchError,
        clearError,
        fetchUrls,
        shortenUrl,
        removeUrl: handleRemoveUrl,
        currentUrl,
        clearCurrentUrl,
    };
}

export default useUrls;
