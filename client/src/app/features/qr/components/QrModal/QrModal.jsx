import { useState, useEffect } from 'react';
import {
    X,
    Download,
    QrCode as QrIcon,
    Copy,
    Check,
    Edit3,
    Eye,
    ScanLine,
    MousePointerClick,
    ExternalLink,
} from 'lucide-react';
import { useQrCode } from '../../hooks/useQrCode.js';
import { EditUrlModal } from '../EditUrlModal/EditUrlModal.jsx';
import './QrModal.scss';

export const QrModal = ({ isOpen, onClose, urlItem }) => {
    const { generateQrDataUrl, generateQrSvg, downloadPng, downloadSvg } = useQrCode();

    const [size, setSize] = useState(512);
    const [foreground, setForeground] = useState('#000000');
    const [background, setBackground] = useState('#ffffff');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [qrSvgString, setQrSvgString] = useState('');
    const [copied, setCopied] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

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
                    size,
                    foreground,
                    background,
                });
                const svgString = await generateQrSvg(qrTargetUrl, {
                    size,
                    foreground,
                    background,
                });
                if (!isCancelled) {
                    setQrDataUrl(dataUrl);
                    setQrSvgString(svgString);
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
    }, [isOpen, urlItem, qrTargetUrl, size, foreground, background, generateQrDataUrl, generateQrSvg]);

    if (!isOpen || !urlItem) return null;

    const handleCopyTarget = () => {
        navigator.clipboard.writeText(fullShortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPng = () => {
        downloadPng(qrDataUrl, `qr-${urlItem.shortUrl}.png`);
    };

    const handleDownloadSvg = () => {
        downloadSvg(qrSvgString, `qr-${urlItem.shortUrl}.svg`);
    };

    const totalClicks = urlItem.clicks ?? 0;
    const qrScans = urlItem.qrScans ?? 0;
    const directClicks = Math.max(0, totalClicks - qrScans);

    return (
        <>
            <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
                <div className="modal-card qr-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="header-title-wrap">
                            <div className="qr-badge-icon">
                                <QrIcon size={20} />
                            </div>
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
                            <div
                                className="qr-canvas-box"
                                style={{ backgroundColor: background }}
                            >
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

                            {/* Scan count badge overlay */}
                            <div className="qr-stats-pill">
                                <span className="stat-pill-item" title="Scanned via camera/scanner">
                                    <ScanLine size={13} />
                                    <strong>{qrScans}</strong> scans
                                </span>
                                <span className="stat-divider">•</span>
                                <span className="stat-pill-item" title="Clicked directly in browser">
                                    <MousePointerClick size={13} />
                                    <strong>{directClicks}</strong> direct
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

                        {/* Customization controls */}
                        <div className="customizer-panel">
                            <span className="section-title">Customize Appearance</span>
                            <div className="controls-grid">
                                <div className="control-group">
                                    <label>Size</label>
                                    <div className="pill-selector">
                                        {[256, 512, 1024].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                className={`pill-btn ${size === s ? 'active' : ''}`}
                                                onClick={() => setSize(s)}
                                            >
                                                {s}px
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="control-group">
                                    <label>Colors</label>
                                    <div className="color-pickers">
                                        <div className="color-picker-item" title="Pattern Color">
                                            <span className="color-label">Pattern</span>
                                            <input
                                                type="color"
                                                value={foreground}
                                                onChange={(e) => setForeground(e.target.value)}
                                            />
                                        </div>
                                        <div className="color-picker-item" title="Background Color">
                                            <span className="color-label">Background</span>
                                            <input
                                                type="color"
                                                value={background}
                                                onChange={(e) => setBackground(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
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

                        {/* Download Action Buttons */}
                        <div className="download-actions-grid">
                            <button
                                type="button"
                                className="btn-download primary"
                                onClick={handleDownloadPng}
                            >
                                <Download size={15} />
                                <span>Download PNG</span>
                            </button>
                            <button
                                type="button"
                                className="btn-download secondary"
                                onClick={handleDownloadSvg}
                            >
                                <Download size={15} />
                                <span>Download SVG</span>
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
        </>
    );
};

export default QrModal;
