import { useState } from 'react';
import {
    Copy,
    Check,
    ExternalLink,
    Trash2,
    MousePointerClick,
    CornerDownRight,
    Loader2,
} from 'lucide-react';
import { useClipboard } from '../../hooks/index.js';
import './UrlCard.scss';

export const UrlCard = ({ item, onDelete, isDeleting }) => {
    const { copyToClipboard, isCopied } = useClipboard();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const fullShortUrl = `${window.location.protocol}//${window.location.host}/${item.shortUrl}`;
    const formattedDate = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : '';

    const handleDelete = () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
            return;
        }
        onDelete(item._id || item.id || item.shortUrl);
    };

    return (
        <div className="url-card">
            <div className="url-card-main">
                <div className="url-identifiers">
                    <a
                        href={fullShortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="short-code-link"
                    >
                        /{item.shortUrl}
                        <ExternalLink size={12} />
                    </a>

                    <span className="clicks-badge">
                        <MousePointerClick size={12} />
                        {item.clicks ?? 0} clicks
                    </span>

                    {formattedDate && <span className="date-badge">{formattedDate}</span>}
                </div>

                <div className="original-url-row">
                    <CornerDownRight size={13} />
                    <a
                        href={item.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="target-url"
                        title={item.originalUrl}
                    >
                        {item.originalUrl}
                    </a>
                </div>
            </div>

            <div className="url-card-actions">
                <button
                    type="button"
                    className={`btn-icon ${isCopied(item.shortUrl) ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(fullShortUrl, item.shortUrl)}
                    title="Copy short link"
                    aria-label="Copy short link"
                >
                    {isCopied(item.shortUrl) ? <Check size={14} /> : <Copy size={14} />}
                </button>

                <a
                    href={fullShortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon"
                    title="Open short link"
                    aria-label="Open short link"
                >
                    <ExternalLink size={14} />
                </a>

                <button
                    type="button"
                    className={`btn-icon delete-btn ${confirmDelete ? 'confirm-danger' : ''}`}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    title={confirmDelete ? 'Click again to confirm deletion' : 'Delete URL'}
                    aria-label="Delete URL"
                >
                    {isDeleting ? <Loader2 size={14} className="spinner" /> : <Trash2 size={14} />}
                </button>
            </div>
        </div>
    );
};

export default UrlCard;
