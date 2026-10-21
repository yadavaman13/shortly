import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link2, QrCode } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { UrlStats, UrlForm, UrlResult, UrlList } from '../../features/url/components/index.js';
import { QrForm, QrResult, QrStats, QrList } from '../../features/qr/components/index.js';
import '../../features/qr/pages/QrPage/QrPage.scss';
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

                            {isAuthenticated && (
                                <>
                                    <UrlStats />
                                    <UrlList />
                                </>
                            )}
                        </div>
                    ) : (
                        /* QR Tool View */
                        <div className="tool-view-content" key="qr-view">
                            <QrForm />
                            <QrResult />

                            {isAuthenticated && (
                                <>
                                    <QrStats />
                                    <QrList />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default MainDashboard;
