import { useState, useMemo } from 'react';
import { Search, RefreshCw, SearchX, Inbox, X, Loader2 } from 'lucide-react';
import { useQrContext } from '../../context/qrContext.jsx';
import { useUrlContext } from '../../../url/context/urlContext.jsx';
import { UrlCard } from '../../../url/components/UrlCard/UrlCard.jsx';
import '../../../url/components/UrlList/UrlList.scss';

export const QrList = () => {
    const { qrUrls, loading, fetchQrUrls } = useQrContext();
    const { removeUrl, deletingId } = useUrlContext();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredQrUrls = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return qrUrls;
        return qrUrls.filter(
            (item) =>
                item.shortUrl?.toLowerCase().includes(q) ||
                item.originalUrl?.toLowerCase().includes(q)
        );
    }, [qrUrls, searchQuery]);

    const handleDelete = async (id) => {
        await removeUrl(id);
        if (fetchQrUrls) {
            fetchQrUrls();
        }
    };

    return (
        <section className="url-list-section">
            <div className="url-list-toolbar">
                <div className="toolbar-title-wrap">
                    <h3 className="list-title">Dynamic QR Codes</h3>
                    <span className="count-pill">
                        {qrUrls.length} {qrUrls.length === 1 ? 'code' : 'codes'}
                    </span>
                </div>

                <div className="toolbar-actions">
                    <div className="search-wrapper">
                        <span className="search-icon">
                            <Search size={14} />
                        </span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Filter QR codes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={() => setSearchQuery('')}
                                title="Clear filter"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        className="refresh-btn"
                        onClick={fetchQrUrls}
                        disabled={loading}
                        title="Reload QR codes"
                        aria-label="Reload QR codes"
                    >
                        <RefreshCw size={15} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="url-items-container">
                {loading && qrUrls.length === 0 ? (
                    <>
                        <div className="url-skeleton-card" />
                        <div className="url-skeleton-card" />
                        <div className="url-skeleton-card" />
                    </>
                ) : qrUrls.length === 0 ? (
                    <div className="url-empty-state">
                        <div className="empty-icon-wrap">
                            <Inbox size={24} />
                        </div>
                        <h4 className="empty-title">No QR codes yet</h4>
                        <p className="empty-desc">
                            Enter any destination URL in the form above to generate your first
                            resilient dynamic QR code.
                        </p>
                    </div>
                ) : filteredQrUrls.length === 0 ? (
                    <div className="url-empty-state">
                        <div className="empty-icon-wrap">
                            <SearchX size={24} />
                        </div>
                        <h4 className="empty-title">No matching QR codes</h4>
                        <p className="empty-desc">
                            No QR codes matched "{searchQuery}". Try a different filter term.
                        </p>
                    </div>
                ) : (
                    filteredQrUrls.map((item) => (
                        <UrlCard
                            key={item._id || item.id || item.shortUrl}
                            item={item}
                            onDelete={handleDelete}
                            isDeleting={deletingId === (item._id || item.id || item.shortUrl)}
                        />
                    ))
                )}
            </div>
        </section>
    );
};

export default QrList;
