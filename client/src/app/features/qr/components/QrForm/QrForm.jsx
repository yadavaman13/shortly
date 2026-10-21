import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QrCode, ArrowRight, Loader2, Clipboard, X } from 'lucide-react';
import { useQrContext } from '../../context/qrContext.jsx';
import { useAuth } from '../../../auth/hooks/useAuth.js';
import './QrForm.scss';

export const QrForm = () => {
    const { generateQr, submitting, error, clearError } = useQrContext();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [urlInput, setUrlInput] = useState(() => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            const saved = sessionStorage.getItem('shortly_pending_qr_url');
            if (saved) {
                sessionStorage.removeItem('shortly_pending_qr_url');
                return saved;
            }
        }
        return '';
    });
    const [validationError, setValidationError] = useState('');

    const handlePaste = async () => {
        try {
            if (navigator?.clipboard?.readText) {
                const text = await navigator.clipboard.readText();
                if (text) {
                    setUrlInput(text.trim());
                    if (validationError) setValidationError('');
                    if (error && clearError) clearError();
                }
            }
        } catch (err) {
            console.warn('Clipboard read permission denied or unavailable:', err);
        }
    };

    const handleButtonClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            if (urlInput.trim()) {
                sessionStorage.setItem('shortly_pending_qr_url', urlInput.trim());
            }
            navigate('/login', { state: { from: location } });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            if (urlInput.trim()) {
                sessionStorage.setItem('shortly_pending_qr_url', urlInput.trim());
            }
            navigate('/login', { state: { from: location } });
            return;
        }

        setValidationError('');
        if (clearError) clearError();

        const trimmed = urlInput.trim();
        if (!trimmed) {
            setValidationError('Please enter a destination URL');
            return;
        }

        if (!/^https?:\/\//i.test(trimmed)) {
            setValidationError('URL must start with http:// or https://');
            return;
        }

        try {
            await generateQr(trimmed);
            setUrlInput('');
        } catch {
            // Error is handled via context toast/error
        }
    };

    return (
        <div className="url-form-container">
            <div className="url-form-header">
                <h2 className="form-title">Generate a dynamic QR code</h2>
                <p className="form-subtitle">
                    Enter any long URL to create a permanent, update-resilient dynamic QR code.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="url-form" noValidate>
                <div className={`input-group-main ${validationError || error ? 'has-error' : ''}`}>
                    <span className="input-icon">
                        <QrCode size={18} />
                    </span>

                    <input
                        type="url"
                        className="main-url-input"
                        placeholder="https://example.com/very-long-destination-url..."
                        value={urlInput}
                        onChange={(e) => {
                            setUrlInput(e.target.value);
                            if (validationError) setValidationError('');
                            if (error && clearError) clearError();
                        }}
                        autoComplete="off"
                        spellCheck="false"
                        disabled={submitting}
                    />

                    <div className="input-actions">
                        {urlInput ? (
                            <button
                                type="button"
                                className="clear-btn"
                                onClick={() => {
                                    setUrlInput('');
                                    if (validationError) setValidationError('');
                                    if (error && clearError) clearError();
                                }}
                                title="Clear URL"
                                aria-label="Clear input"
                            >
                                <X size={14} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="paste-btn"
                                onClick={handlePaste}
                                title="Paste from clipboard"
                            >
                                <Clipboard size={13} />
                                <span>Paste</span>
                            </button>
                        )}
                    </div>
                </div>

                {(validationError || error) && (
                    <div className="field-error">{validationError || error}</div>
                )}

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting || (isAuthenticated && !urlInput.trim())}
                    onClick={handleButtonClick}
                >
                    {submitting ? (
                        <>
                            <Loader2 size={16} className="spinner" />
                            <span>Generating QR Code...</span>
                        </>
                    ) : (
                        <>
                            <span>Generate QR Code</span>
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default QrForm;
