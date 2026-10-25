import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, ShieldCheck, X, LogOut } from 'lucide-react';
import './AccountModal.scss';

export const AccountModal = ({ isOpen, onClose, user, onLogout }) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !user) return null;

    const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';

    return createPortal(
        <div className="account-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
            <div className="account-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-title-wrap">
                        <span className="badge-pill">Account Profile</span>
                        <h3>My Account</h3>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="account-avatar-banner">
                        <div className={`avatar-circle ${user.profilePicture ? 'has-image' : ''}`}>
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.username}
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                initial
                            )}
                        </div>
                        <div className="avatar-meta">
                            <span className="account-username">{user.username}</span>
                        </div>
                    </div>

                    <div className="account-details-grid">
                        <div className="detail-item">
                            <span className="detail-label">
                                <User size={13} /> Username
                            </span>
                            <span className="detail-value">{user.username}</span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">
                                <Mail size={13} /> Email Address
                            </span>
                            <span className="detail-value">{user.email || '—'}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn-signout"
                        onClick={() => {
                            onClose();
                            onLogout();
                        }}
                    >
                        <LogOut size={14} />
                        <span>Log Out</span>
                    </button>
                    <button type="button" className="btn-done" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AccountModal;
