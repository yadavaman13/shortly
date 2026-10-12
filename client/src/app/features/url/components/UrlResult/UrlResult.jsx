import { Check, Copy, ExternalLink, X, Sparkles } from 'lucide-react';
import { useUrlContext } from '../../context/urlContext.jsx';
import { useClipboard } from '../../hooks/index.js';
import './UrlResult.scss';

export const UrlResult = () => {
    const { currentUrl, clearCurrentUrl } = useUrlContext();
    const { copyToClipboard, isCopied } = useClipboard();

    if (!currentUrl) return null;

    // Build the full redirect URL
    const fullUrl =
        currentUrl.fullShortUrl ||
        `${window.location.protocol}//${window.location.host}/${currentUrl.shortUrl}`;

    return (
        <div className="url-result-card">
            <span className="result-badge">
                <Sparkles size={12} />
                Link Ready
            </span>

            <button
                type="button"
                className="dismiss-btn"
                onClick={clearCurrentUrl}
                title="Dismiss"
                aria-label="Dismiss banner"
            >
                <X size={16} />
            </button>

            <div className="result-body">
                <div className="short-url-text">{fullUrl}</div>

                <div className="result-actions">
                    <button
                        type="button"
                        className="action-btn primary"
                        onClick={() => copyToClipboard(fullUrl, 'result-copy')}
                    >
                        {isCopied('result-copy') ? (
                            <>
                                <Check size={14} />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                <span>Copy</span>
                            </>
                        )}
                    </button>

                    <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn secondary"
                    >
                        <ExternalLink size={14} />
                        <span>Visit</span>
                    </a>
                </div>
            </div>

            <div className="original-url-preview">
                <span className="label">Destination:</span>
                <a
                    href={currentUrl.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="original-link"
                >
                    {currentUrl.originalUrl}
                </a>
            </div>
        </div>
    );
};

export default UrlResult;
