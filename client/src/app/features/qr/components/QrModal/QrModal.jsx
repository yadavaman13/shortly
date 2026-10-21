import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Download,
    QrCode as QrIcon,
    Copy,
    Check,
    Edit3,
    MousePointerClick,
    ExternalLink,
} from 'lucide-react';
import { useQrCode } from '../../hooks/useQrCode.js';
import { EditUrlModal } from '../EditUrlModal/EditUrlModal.jsx';
import './QrModal.scss';

export const QrModal = ({ isOpen, onClose, urlItem }) => {
    const { generateQrDataUrl, downloadPng } = useQrCode();

    const [qrDataUrl, setQrDataUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !showEditModal) {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, showEditModal, onClose]);

    const fullShortUrl = urlItem
        ? `${window.location.protocol}//${window.location.host}/${urlItem.shortUrl}`
        : '';
    const qrTargetUrl = `${fullShortUrl}?ref=qr`;

    useEffect(() => {
        let isCancelled = false;

        const updateQr = async () => {
            if (!urlItem) return;
            try {
                const dataUrl = await generateQrDataUrl(qrTargetUrl, {
                    size: 1024,
                    foreground: '#000000',
                    background: '#ffffff',
                });
                if (!isCancelled) {
                    setQrDataUrl(dataUrl);
                }
            } catch (err) {
                console.error('Error generating QR in modal:', err);
            }
        };

        if (isOpen && urlItem) {
            updateQr();
        }

        return () => {
            isCancelled = true;
        };
    }, [isOpen, urlItem, qrTargetUrl, generateQrDataUrl]);

    if (!isOpen || !urlItem) return null;

    const handleCopyTarget = () => {
        navigator.clipboard.writeText(fullShortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPng = () => {
        downloadPng(qrDataUrl, `qr-${urlItem.shortUrl}.png`);
    };

    const totalClicks = urlItem.clicks ?? 0;

    return createPortal(
        <>
            <div className="modal-backdrop qr-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
                <div className="modal-card qr-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="header-title-wrap">
                            <div>
                                <h3>QR Code</h3>
                                <p className="subtitle">/{urlItem.shortUrl}</p>
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

                    <div className="modal-body qr-modal-body">
                        {/* QR Code Preview Frame */}
                        <div className="qr-preview-container">
                            <div className="qr-canvas-box" style={{ backgroundColor: '#ffffff' }}>
                                {qrDataUrl ? (
                                    <img
                                        src={qrDataUrl}
                                        alt={`QR Code for /${urlItem.shortUrl}`}
                                        className="qr-image"
                                    />
                                ) : (
                                    <div className="qr-placeholder">Generating QR...</div>
                                )}
                            </div>

                            {/* Clicks badge overlay */}
                            <div className="qr-stats-pill">
                                <span className="stat-pill-item" title="Total link clicks">
                                    <MousePointerClick size={13} />
                                    <strong>{totalClicks}</strong> clicks
                                </span>
                            </div>
                        </div>

                        {/* Short link row with quick copy */}
                        <div className="short-url-action-row">
                            <div className="short-link-badge">
                                <span className="link-text">{fullShortUrl}</span>
                            </div>
                            <button
                                type="button"
                                className={`copy-btn ${copied ? 'copied' : ''}`}
                                onClick={handleCopyTarget}
                                title="Copy short link"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                            <a
                                href={fullShortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-btn"
                                title="Open link in new tab"
                            >
                                <ExternalLink size={14} />
                            </a>
                        </div>

                        {/* Resilient QR Destination Banner */}
                        <div className="resilient-destination-banner">
                            <div className="destination-info">
                                <span className="label">Current Destination</span>
                                <span className="destination-url" title={urlItem.originalUrl}>
                                    {urlItem.originalUrl}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="btn-edit-destination"
                                onClick={() => setShowEditModal(true)}
                                title="Change where this QR points without reprinting"
                            >
                                <Edit3 size={13} />
                                <span>Change Destination</span>
                            </button>
                        </div>

                        {/* Download Action Button (PNG format) */}
                        <div className="download-actions-grid">
                            <button
                                type="button"
                                className="btn-download primary"
                                onClick={handleDownloadPng}
                            >
                                <Download size={15} />
                                <span>Download QR</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Destination Modal */}
            <EditUrlModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                urlItem={urlItem}
            />
        </>,
        document.body
    );
};

export default QrModal;
