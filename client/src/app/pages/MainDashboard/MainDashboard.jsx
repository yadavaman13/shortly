import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Link2,
    QrCode,
    ShieldCheck,
    ScanLine,
    Layers,
    ArrowUpRight,
    Edit3,
    CornerDownRight,
    Loader2,
    Lock,
    LogIn,
    UserPlus,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { UrlStats, UrlForm, UrlResult, UrlList } from '../../features/url/components/index.js';
import { QrForm, QrResult, QrModal, EditUrlModal } from '../../features/qr/components/index.js';
import { useQrContext } from '../../features/qr/context/qrContext.jsx';
import './MainDashboard.scss';

export const MainDashboard = () => {
    const { isAuthenticated } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Support ?tab=url or ?tab=qr in URL query
    const initialTab = searchParams.get('tab') === 'qr' ? 'qr' : 'url';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync tab when search params change
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'qr' || tabParam === 'url') {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams(tab === 'url' ? {} : { tab });
    };

    // QR State and Modals
    const { qrUrls, loading: qrLoading } = useQrContext();
    const [selectedForQrModal, setSelectedForQrModal] = useState(null);
    const [selectedForEditModal, setSelectedForEditModal] = useState(null);

    const totalQrCodes = qrUrls.length;
    const totalScans = qrUrls.reduce((acc, curr) => acc + (curr.qrScans || 0), 0);
    const totalUpdates = qrUrls.reduce((acc, curr) => acc + (curr.editHistory?.length || 0), 0);

    return (
        <main className="main-content blueprint-dashboard">
            {/* Blueprint Glowing Hero Banner */}
            <section className="blueprint-hero-banner" aria-label="Hero Introduction">
                <div className="hero-banner-inner">
                    <h1 className="hero-banner-title">One Link, Endless Possibilities.</h1>
                    <p className="hero-banner-description">
                        Create short, memorable links and dynamic QR codes in seconds. Track every
                        click, discover what works, and update destinations anytime. All from one
                        powerful platform.
                    </p>
                </div>
            </section>

            {/* Blueprint Main Interactive Card */}
            <section className="blueprint-main-card">
                {/* Segmented Switcher: [ URL | QR ] */}
                <div className="segmented-switcher-wrap" role="tablist" aria-label="Tool Selector">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'url'}
                        className={`segmented-btn ${activeTab === 'url' ? 'active' : ''}`}
                        onClick={() => handleTabChange('url')}
                    >
                        <Link2 size={16} />
                        <span>URL</span>
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'qr'}
                        className={`segmented-btn ${activeTab === 'qr' ? 'active' : ''}`}
                        onClick={() => handleTabChange('qr')}
                    >
                        <QrCode size={16} />
                        <span>QR</span>
                    </button>
                </div>

                {/* Inner Tool Container Frame */}
                <div className="blueprint-inner-card">
                    {activeTab === 'url' ? (
                        /* URL Tool View */
                        <div className="tool-view-content" key="url-view">
                            <UrlForm />
                            <UrlResult />

                            {isAuthenticated ? (
                                <>
                                    <UrlStats />
                                    <UrlList />
                                </>
                            ) : (
                                <div className="guest-cta-card">
                                    <div className="cta-icon-wrap">
                                        <Lock size={22} />
                                    </div>
                                    <div className="cta-content">
                                        <h3>Unlock Complete Link Analytics</h3>
                                        <p>
                                            Sign in or create a free account to track real-time
                                            click metrics, search and filter your links, and update
                                            destinations anytime.
                                        </p>
                                    </div>
                                    <div className="cta-actions">
                                        <Link to="/login" className="btn-cta signin">
                                            <LogIn size={14} />
                                            <span>Sign in</span>
                                        </Link>
                                        <Link to="/register" className="btn-cta register">
                                            <UserPlus size={14} />
                                            <span>Register</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* QR Tool View */
                        <div className="tool-view-content" key="qr-view">
                            <QrForm />
                            <QrResult />

                            {isAuthenticated ? (
                                <>
                                    {/* Quick stats counter */}
                                    <section className="qr-stats-grid">
                                        <div className="qr-stat-card">
                                            <div className="stat-icon">
                                                <QrCode size={18} />
                                            </div>
                                            <div className="stat-data">
                                                <span className="stat-number">{totalQrCodes}</span>
                                                <span className="stat-label">Active QR Codes</span>
                                            </div>
                                        </div>

                                        <div className="qr-stat-card">
                                            <div className="stat-icon">
                                                <ScanLine size={18} />
                                            </div>
                                            <div className="stat-data">
                                                <span className="stat-number">{totalScans}</span>
                                                <span className="stat-label">
                                                    Total Camera Scans
                                                </span>
                                            </div>
                                        </div>

                                        <div className="qr-stat-card">
                                            <div className="stat-icon">
                                                <Layers size={18} />
                                            </div>
                                            <div className="stat-data">
                                                <span className="stat-number">{totalUpdates}</span>
                                                <span className="stat-label">
                                                    Resilient Link Updates
                                                </span>
                                            </div>
                                        </div>
                                    </section>

                                    {/* List of saved QR codes */}
                                    <section className="saved-qr-section">
                                        <div className="section-header">
                                            <h2>Your QR Codes</h2>
                                            <span className="count-tag">{qrUrls.length} total</span>
                                        </div>

                                        {qrLoading ? (
                                            <div className="loading-state">
                                                <Loader2 size={24} className="spinner" />
                                                <span>Loading QR codes...</span>
                                            </div>
                                        ) : qrUrls.length === 0 ? (
                                            <div className="empty-qr-card">
                                                <div className="empty-icon">
                                                    <QrCode size={30} />
                                                </div>
                                                <h3>No QR codes generated yet</h3>
                                                <p>
                                                    Enter any URL above to generate your first
                                                    resilient dynamic QR code.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="qr-links-grid">
                                                {qrUrls.map((item) => {
                                                    const fullShortUrl = `${window.location.protocol}//${window.location.host}/${item.shortUrl}`;
                                                    return (
                                                        <div
                                                            key={
                                                                item._id || item.id || item.shortUrl
                                                            }
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
                                                                <div className="item-badges">
                                                                    <span className="scan-count-badge">
                                                                        <ScanLine size={12} />
                                                                        {item.qrScans || 0} scans
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="item-destination">
                                                                <CornerDownRight size={13} />
                                                                <span
                                                                    className="dest-text"
                                                                    title={item.originalUrl}
                                                                >
                                                                    {item.originalUrl}
                                                                </span>
                                                            </div>

                                                            <div className="item-footer">
                                                                <button
                                                                    type="button"
                                                                    className="btn-item-action"
                                                                    onClick={() =>
                                                                        setSelectedForQrModal(item)
                                                                    }
                                                                    title="View & Download QR"
                                                                >
                                                                    <QrCode size={14} />
                                                                    <span>View QR</span>
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn-item-action edit"
                                                                    onClick={() =>
                                                                        setSelectedForEditModal(
                                                                            item,
                                                                        )
                                                                    }
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
                                </>
                            ) : (
                                <div className="guest-cta-card">
                                    <div className="cta-icon-wrap">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div className="cta-content">
                                        <h3>Permanent Print Reliability</h3>
                                        <p>
                                            Sign in to save resilient dynamic QR codes, track camera
                                            scans, and update destination URLs anytime without
                                            invalidating physical prints.
                                        </p>
                                    </div>
                                    <div className="cta-actions">
                                        <Link to="/login" className="btn-cta signin">
                                            <LogIn size={14} />
                                            <span>Sign in</span>
                                        </Link>
                                        <Link to="/register" className="btn-cta register">
                                            <UserPlus size={14} />
                                            <span>Register</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* QR Modals */}
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

export default MainDashboard;
