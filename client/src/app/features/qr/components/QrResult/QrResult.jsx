import { useState, useEffect } from 'react';
import {
    Download,
    Copy,
    Check,
    ExternalLink,
    Edit3,
    ShieldCheck,
    History,
    ScanLine,
    MousePointerClick,
    X,
    Sparkles,
} from 'lucide-react';
import { useQrContext } from '../../context/qrContext.jsx';
import { useQrCode } from '../../hooks/useQrCode.js';
import { EditUrlModal } from '../EditUrlModal/EditUrlModal.jsx';
import './QrResult.scss';

export const QrResult = () => {
    const { currentQr, clearCurrentQr } = useQrContext();
    const { generateQrDataUrl, generateQrSvg, downloadPng, downloadSvg } = useQrCode();

    const [size, setSize] = useState(512);
    const [foreground, setForeground] = useState('#000000');
    const [background, setBackground] = useState('#ffffff');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [qrSvgString, setQrSvgString] = useState('');
    const [copied, setCopied] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const fullShortUrl = currentQr?.fullShortUrl || (currentQr?.shortUrl
        ? `${window.location.protocol}//${window.location.host}/${currentQr.shortUrl}`
        : '');
    const qrTargetUrl = currentQr?.qrTargetUrl || `${fullShortUrl}?ref=qr`;

    useEffect(() => {
        let isCancelled = false;

        const renderQr = async () => {
            if (!currentQr) return;
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
                console.error('Error generating QR in QrResult:', err);
            }
        };

        if (currentQr) {
            renderQr();
        }

        return () => {
            isCancelled = true;
        };
    }, [currentQr, qrTargetUrl, size, foreground, background, generateQrDataUrl, generateQrSvg]);

    if (!currentQr) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullShortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPng = () => {
        downloadPng(qrDataUrl, `shortly-qr-${currentQr.shortUrl}.png`);
    };

    const handleDownloadSvg = () => {
        downloadSvg(qrSvgString, `shortly-qr-${currentQr.shortUrl}.svg`);
    };

    const totalClicks = currentQr.clicks ?? 0;
    const qrScans = currentQr.qrScans ?? 0;
    const directClicks = Math.max(0, totalClicks - qrScans);
    const editHistory = currentQr.editHistory || [];

    return (
        <section className="qr-result-section">
            <div className="qr-result-card">
                <div className="result-header">
                    <div className="result-badge">
                        <Sparkles size={14} />
                        <span>Ready to Use</span>
                    </div>
                    <button
                        type="button"
                        className="btn-dismiss"
                        onClick={clearCurrentQr}
                        title="Dismiss"
                        aria-label="Dismiss result"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="result-content-grid">
                    {/* Left: QR Canvas Preview & Stats */}
                    <div className="qr-preview-col">
                        <div
                            className="qr-canvas-wrapper"
                            style={{ backgroundColor: background }}
                        >
                            {qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt={`QR Code for ${currentQr.shortUrl}`}
                                    className="qr-result-image"
                                />
                            ) : (
                                <div className="qr-loader">Generating preview...</div>
                            )}
                        </div>

                        <div className="qr-metrics-bar">
                            <div className="metric-item">
                                <ScanLine size={14} />
                                <div>
                                    <span className="metric-val">{qrScans}</span>
                                    <span className="metric-lbl">QR Scans</span>
                                </div>
                            </div>
                            <div className="metric-divider" />
                            <div className="metric-item">
                                <MousePointerClick size={14} />
                                <div>
                                    <span className="metric-val">{directClicks}</span>
                                    <span className="metric-lbl">Direct Clicks</span>
                                </div>
                            </div>
                        </div>

                        {/* Download buttons */}
                        <div className="download-buttons-row">
                            <button
                                type="button"
                                className="btn-dl primary"
                                onClick={handleDownloadPng}
                            >
                                <Download size={14} />
                                <span>Download PNG</span>
                            </button>
                            <button
                                type="button"
                                className="btn-dl secondary"
                                onClick={handleDownloadSvg}
                            >
                                <Download size={14} />
                                <span>Download SVG</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Link Info, Customizer, Resilient Status */}
                    <div className="qr-details-col">
                        <div className="short-url-banner">
                            <div className="url-meta">
                                <span className="meta-label">Short Link</span>
                                <span className="short-url-text">{fullShortUrl}</span>
                            </div>
                            <div className="url-actions">
                                <button
                                    type="button"
                                    className={`btn-action-copy ${copied ? 'copied' : ''}`}
                                    onClick={handleCopy}
                                    title="Copy short link"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    <span>{copied ? 'Copied' : 'Copy'}</span>
                                </button>
                                <a
                                    href={fullShortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-action-open"
                                    title="Open link in new tab"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>

                        {/* Customization controls */}
                        <div className="style-controls-card">
                            <span className="card-label">QR Customizer</span>
                            <div className="style-controls-grid">
                                <div className="style-group">
                                    <span className="group-label">Resolution</span>
                                    <div className="pill-group">
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

                                <div className="style-group">
                                    <span className="group-label">Palette</span>
                                    <div className="colors-row">
                                        <div className="color-pair">
                                            <span>Pattern</span>
                                            <input
                                                type="color"
                                                value={foreground}
                                                onChange={(e) => setForeground(e.target.value)}
                                            />
                                        </div>
                                        <div className="color-pair">
                                            <span>Background</span>
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

                        {/* Resilient QR Destination Feature Card */}
                        <div className="resilient-status-card">
                            <div className="resilient-top">
                                <div className="shield-tag">
                                    <ShieldCheck size={14} />
                                    <span>Resilient Destination</span>
                                </div>
                                <span className="resilient-explainer">
                                    Change destination anytime without reprinting
                                </span>
                            </div>

                            <div className="current-target-box">
                                <span className="target-label">Current Target</span>
                                <span className="target-url" title={currentQr.originalUrl}>
                                    {currentQr.originalUrl}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="btn-edit-target"
                                onClick={() => setShowEditModal(true)}
                            >
                                <Edit3 size={14} />
                                <span>Change Destination</span>
                            </button>

                            {editHistory.length > 0 && (
                                <div className="history-drawer">
                                    <div className="history-title">
                                        <History size={13} />
                                        <span>Edit History</span>
                                    </div>
                                    <ul className="history-items">
                                        {editHistory.slice(-2).reverse().map((h, i) => (
                                            <li key={i} className="history-row">
                                                <span className="prev-url" title={h.previousUrl}>
                                                    {h.previousUrl}
                                                </span>
                                                <span className="prev-date">
                                                    {new Date(h.changedAt).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for editing destination */}
            <EditUrlModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                urlItem={currentQr}
            />
        </section>
    );
};

export default QrResult;
