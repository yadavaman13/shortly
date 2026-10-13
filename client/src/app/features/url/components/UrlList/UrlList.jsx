import { Search, RefreshCw, SearchX, Inbox, X, Loader2 } from 'lucide-react';
import { useUrls } from '../../hooks/index.js';
import { UrlCard } from '../UrlCard/UrlCard.jsx';
import './UrlList.scss';

export const UrlList = () => {
    const {
        urls,
        allUrls,
        searchQuery,
        setSearchQuery,
        isSearching,
        loading,
        deletingId,
        removeUrl,
        fetchUrls,
    } = useUrls();

    return (
        <section className="url-list-section">
            <div className="url-list-toolbar">
                <div className="toolbar-title-wrap">
                    <h3 className="list-title">Shortened Links</h3>
                    <span className="count-pill">
                        {allUrls.length} {allUrls.length === 1 ? 'link' : 'links'}
                    </span>
                </div>

                <div className="toolbar-actions">
                    <div className="search-wrapper">
                        <span className="search-icon">
                            {isSearching ? (
                                <Loader2 size={14} className="spin" />
                            ) : (
                                <Search size={14} />
                            )}
                        </span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Filter links..."
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
                        onClick={fetchUrls}
                        disabled={loading}
                        title="Reload URLs"
                        aria-label="Reload URLs"
                    >
                        <RefreshCw size={15} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="url-items-container">
                {loading && allUrls.length === 0 ? (
                    <>
                        <div className="url-skeleton-card" />
                        <div className="url-skeleton-card" />
                        <div className="url-skeleton-card" />
                    </>
                ) : allUrls.length === 0 ? (
                    <div className="url-empty-state">
                        <div className="empty-icon-wrap">
                            <Inbox size={24} />
                        </div>
                        <h4 className="empty-title">No shortened URLs yet</h4>
                        <p className="empty-desc">
                            Enter a destination URL in the form above to generate your first
                            trackable short link.
                        </p>
                    </div>
                ) : urls.length === 0 ? (
                    <div className="url-empty-state">
                        <div className="empty-icon-wrap">
                            <SearchX size={24} />
                        </div>
                        <h4 className="empty-title">No matching links</h4>
                        <p className="empty-desc">
                            No shortened links matched "{searchQuery}". Try a different filter term.
                        </p>
                    </div>
                ) : (
                    urls.map((item) => (
                        <UrlCard
                            key={item._id || item.id || item.shortUrl}
                            item={item}
                            onDelete={removeUrl}
                            isDeleting={deletingId === (item._id || item.id || item.shortUrl)}
                        />
                    ))
                )}
            </div>
        </section>
    );
};

export default UrlList;
