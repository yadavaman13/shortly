import { useState } from 'react';
import { Link2, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useQrContext } from '../../context/qrContext.jsx';
import './QrForm.scss';

export const QrForm = () => {
    const { generateQr, submitting, error, clearError } = useQrContext();
    const [urlInput, setUrlInput] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        <section className="qr-form-section">
            <div className="qr-form-card">
                <div className="qr-form-badge-row">
                    <span className="resilient-badge">
                        <ShieldCheck size={13} />
                        Resilient Dynamic QR
                    </span>
                    <span className="badge-hint">
                        Never breaks if the destination link or domain changes
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="qr-input-form">
                    <div className="qr-input-group">
                        <div className="input-icon">
                            <Link2 size={18} />
                        </div>
                        <input
                            type="url"
                            className="qr-text-input"
                            placeholder="Enter long destination URL (e.g. https://mycompany.com/promo)..."
                            value={urlInput}
                            onChange={(e) => {
                                setUrlInput(e.target.value);
                                if (validationError) setValidationError('');
                            }}
                            disabled={submitting}
                            required
                        />
                        <button
                            type="submit"
                            className="btn-generate-qr"
                            disabled={submitting || !urlInput.trim()}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="spinner" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    <span>Generate QR</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>

                    {(validationError || error) && (
                        <div className="qr-form-error">
                            {validationError || error}
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
};

export default QrForm;
