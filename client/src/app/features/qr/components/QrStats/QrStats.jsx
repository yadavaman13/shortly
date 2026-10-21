import { QrCode, Layers, TrendingUp } from 'lucide-react';
import { useQrContext } from '../../context/qrContext.jsx';
import '../../../url/components/UrlStats/UrlStats.scss';

export const QrStats = () => {
    const { qrUrls, loading } = useQrContext();

    const totalQrCodes = qrUrls.length;
    const totalUpdates = qrUrls.reduce((acc, curr) => acc + (curr.editHistory?.length || 0), 0);
    const topQr = qrUrls.length
        ? [...qrUrls].sort((a, b) => (b.clicks || b.qrScans || 0) - (a.clicks || a.qrScans || 0))[0]
        : null;

    return (
        <div className="url-stats-grid">
            <div className="stat-card">
                <div className="stat-header">
                    <span className="stat-label">Total QR Codes</span>
                    <span className="stat-icon">
                        <QrCode size={16} />
                    </span>
                </div>
                <div className="stat-value">{loading ? '-' : totalQrCodes}</div>
                <div className="stat-subtext">Active dynamic QR redirects</div>
            </div>

            <div className="stat-card">
                <div className="stat-header">
                    <span className="stat-label">Total Updates</span>
                    <span className="stat-icon">
                        <Layers size={16} />
                    </span>
                </div>
                <div className="stat-value">{loading ? '-' : totalUpdates}</div>
                <div className="stat-subtext">Resilient destination changes</div>
            </div>

            <div className="stat-card">
                <div className="stat-header">
                    <span className="stat-label">Top Performer</span>
                    <span className="stat-icon">
                        <TrendingUp size={16} />
                    </span>
                </div>
                <div className="stat-value">
                    {topQr ? `${topQr.clicks || topQr.qrScans || 0}` : '0'}
                </div>
                <div className="stat-subtext">
                    {topQr
                        ? `/${topQr.shortUrl} (${topQr.clicks || topQr.qrScans || 0} visits)`
                        : 'No activity yet'}
                </div>
            </div>
        </div>
    );
};

export default QrStats;
