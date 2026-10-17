import { useState } from 'react';
import { X, Globe, ArrowRight, History, ShieldCheck, Loader2 } from 'lucide-react';
import { useUrlContext } from '../../../url/context/urlContext.jsx';
import { useQrContext } from '../../context/qrContext.jsx';
import './EditUrlModal.scss';

export const EditUrlModal = ({ isOpen, onClose, urlItem }) => {
    const { updateUrlDestination } = useUrlContext();
    let qrContext = null;
    try {
        qrContext = useQrContext();
    } catch {
        // Safe fallback
    }

    const [newDestination, setNewDestination] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState(null);

    if (!isOpen || !urlItem) return null;

    const currentUrl = urlItem.originalUrl || '';
    const id = urlItem._id || urlItem.id || urlItem.shortUrl;
    const editHistory = urlItem.editHistory || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        const trimmed = newDestination.trim();
        if (!trimmed) {
            setLocalError('Please enter a new destination URL');
            return;
        }

        if (trimmed === currentUrl) {
            setLocalError('New URL must be different from current destination');
            return;
        }

        if (!/^https?:\/\//i.test(trimmed)) {
            setLocalError('URL must start with http:// or https://');
            return;
        }

        try {
            setSubmitting(true);
            const updated = await updateUrlDestination(id, trimmed);
            if (qrContext?.updateQrDestination) {
                qrContext.updateQrDestination(id, updated);
            }
            setNewDestination('');
            onClose();
        } catch (err) {
            const msg = err.error || err.message || 'Failed to update destination';
            setLocalError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
            <div className="modal-card edit-url-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-title-wrap">
                        <div className="shield-icon">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3>Edit Destination</h3>
                            <p className="subtitle">Resilient Link — QR code stays valid forever</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="usp-banner">
                        <span className="usp-badge">Resilient Architecture</span>
                        <p>
                            Changing the target updates where visitors land. Your printed QR code,
                            short link, and stats remain intact.
                        </p>
                    </div>

                    <div className="current-destination-box">
                        <span className="box-label">Current Destination</span>
                        <div className="url-preview">
                            <Globe size={14} />
                            <span className="url-text" title={currentUrl}>{currentUrl}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="edit-form">
                        <label htmlFor="newDestinationInput" className="box-label">
                            New Destination URL
                        </label>
                        <div className="input-wrap">
                            <input
                                id="newDestinationInput"
                                type="url"
                                placeholder="https://example.com/new-target"
                                value={newDestination}
                                onChange={(e) => setNewDestination(e.target.value)}
                                disabled={submitting}
                                required
                                autoFocus
                            />
                        </div>

                        {localError && <div className="modal-error-message">{localError}</div>}

                        {editHistory.length > 0 && (
                            <div className="history-section">
                                <div className="history-header">
                                    <History size={14} />
                                    <span>Audit History ({editHistory.length} previous)</span>
                                </div>
                                <ul className="history-list">
                                    {editHistory.slice(-3).reverse().map((item, idx) => (
                                        <li key={idx} className="history-item">
                                            <span className="history-url" title={item.previousUrl}>
                                                {item.previousUrl}
                                            </span>
                                            <span className="history-date">
                                                {new Date(item.changedAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={submitting || !newDestination.trim()}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="spinner" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Update Destination</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUrlModal;
