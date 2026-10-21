import { useState } from 'react';
import {
    QrCode as QrIcon,
    ShieldCheck,
    Layers,
    ArrowUpRight,
    Edit3,
    CornerDownRight,
    Loader2,
} from 'lucide-react';
import { useQrContext } from '../../context/qrContext.jsx';
import { useAuth } from '../../../auth/hooks/useAuth.js';
import { QrForm, QrResult, QrModal, EditUrlModal } from '../../components/index.js';
import './QrPage.scss';

export const QrPage = () => {
    const { isAuthenticated } = useAuth();
    const { qrUrls, loading } = useQrContext();
    const [selectedForQrModal, setSelectedForQrModal] = useState(null);
    const [selectedForEditModal, setSelectedForEditModal] = useState(null);

    const totalQrCodes = qrUrls.length;
    const totalUpdates = qrUrls.reduce((acc, curr) => acc + (curr.editHistory?.length || 0), 0);

    return (
        <main className="main-content qr-page">
            <section className="hero-section qr-hero">
                <div className="hero-pill">
                    <ShieldCheck size={14} />
                    <span>Permanent Print Reliability</span>
                </div>
            </section>

            {/* Quick stats counter */}
            {isAuthenticated && (
                <section className="qr-stats-grid">
                    <div className="qr-stat-card">
                        <div className="stat-icon">
                            <QrIcon size={18} />
                        </div>
                        <div className="stat-data">
                            <span className="stat-number">{totalQrCodes}</span>
                            <span className="stat-label">Active QR Codes</span>
                        </div>
                    </div>

                    <div className="qr-stat-card">
                        <div className="stat-icon">
                            <Layers size={18} />
                        </div>
                        <div className="stat-data">
                            <span className="stat-number">{totalUpdates}</span>
                            <span className="stat-label">Resilient Link Updates</span>
                        </div>
                    </div>
                </section>
            )}

            {/* QR Generation Form */}
            <QrForm />

            {/* Live QR Result / Preview */}
            <QrResult />

            {/* List of generated QR codes */}
            {isAuthenticated && (
                <section className="saved-qr-section">
                    <div className="section-header">
                        <h2>Your QR Codes</h2>
                        <span className="count-tag">{qrUrls.length} total</span>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <Loader2 size={24} className="spinner" />
                            <span>Loading QR codes...</span>
                        </div>
                    ) : qrUrls.length === 0 ? (
                        <div className="empty-qr-card">
                            <div className="empty-icon">
                                <QrIcon size={32} />
                            </div>
                            <h3>No QR codes generated yet</h3>
                            <p>Enter any URL above to generate your first resilient dynamic QR code.</p>
                        </div>
                    ) : (
                        <div className="qr-links-grid">
                            {qrUrls.map((item) => {
                                const fullShortUrl = `${window.location.protocol}//${window.location.host}/${item.shortUrl}`;
                                return (
                                    <div
                                        key={item._id || item.id || item.shortUrl}
                                        className="qr-item-card"
                                    >
                                        <div className="item-header">
                                            <a
                                                href={fullShortUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="item-shortcode"
                                            >
                                                /{item.shortUrl}
                                                <ArrowUpRight size={13} />
                                            </a>
                                        </div>

                                        <div className="item-destination">
                                            <CornerDownRight size={13} />
                                            <span className="dest-text" title={item.originalUrl}>
                                                {item.originalUrl}
                                            </span>
                                        </div>

                                        <div className="item-footer">
                                            <button
                                                type="button"
                                                className="btn-item-action"
                                                onClick={() => setSelectedForQrModal(item)}
                                                title="View & Download QR"
                                            >
                                                <QrIcon size={14} />
                                                <span>View QR</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-item-action edit"
                                                onClick={() => setSelectedForEditModal(item)}
                                                title="Edit Destination URL"
                                            >
                                                <Edit3 size={14} />
                                                <span>Edit Target</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {/* Modals */}
            <QrModal
                isOpen={!!selectedForQrModal}
                onClose={() => setSelectedForQrModal(null)}
                urlItem={selectedForQrModal}
            />

            <EditUrlModal
                isOpen={!!selectedForEditModal}
                onClose={() => setSelectedForEditModal(null)}
                urlItem={selectedForEditModal}
            />
        </main>
    );
};

export default QrPage;
