import { useState, useCallback } from 'react';
import { useUrlContext } from '../context/urlContext.jsx';

const INITIAL_FORM = {
    url: '',
};

const getInitialForm = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        const saved = sessionStorage.getItem('shortly_pending_url');
        if (saved) {
            sessionStorage.removeItem('shortly_pending_url');
            return { url: saved };
        }
    }
    return INITIAL_FORM;
};

/**
 * Custom hook to manage URL shortening form state and client validations
 */
export function useShortenForm() {
    const { shortenUrl, submitting, error, clearError } = useUrlContext();
    const [formData, setFormData] = useState(getInitialForm);
    const [formErrors, setFormErrors] = useState({});

    const validate = useCallback(() => {
        const errors = {};
        const trimmedUrl = formData.url.trim();

        if (!trimmedUrl) {
            errors.url = 'URL is required';
        } else if (!/^https?:\/\//i.test(trimmedUrl)) {
            errors.url = 'URL must start with http:// or https://';
        } else if (trimmedUrl.length > 2048) {
            errors.url = 'URL is too long (max 2048 chars)';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    const handleChange = useCallback(
        (field, value) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            if (formErrors[field]) {
                setFormErrors((prev) => ({ ...prev, [field]: null }));
            }
            if (error) clearError();
        },
        [formErrors, error, clearError],
    );

    const handlePaste = useCallback(async () => {
        try {
            if (navigator?.clipboard?.readText) {
                const text = await navigator.clipboard.readText();
                if (text) {
                    handleChange('url', text.trim());
                }
            }
        } catch (err) {
            console.warn('Clipboard read permission denied or unavailable:', err);
        }
    }, [handleChange]);

    const resetForm = useCallback(() => {
        setFormData(INITIAL_FORM);
        setFormErrors({});
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            if (e) e.preventDefault();
            if (!validate()) return null;

            const payload = {
                url: formData.url.trim(),
            };

            const res = await shortenUrl(payload);
            resetForm();
            return res;
        },
        [formData, validate, shortenUrl, resetForm],
    );

    return {
        formData,
        formErrors,
        submitting,
        error,
        handleChange,
        handlePaste,
        handleSubmit,
        resetForm,
    };
}

export default useShortenForm;
