import { useState, useEffect, useRef } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { AccountModal } from '../AccountModal/AccountModal.jsx';
import './Navbar.scss';

export const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('shortly-theme');
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await logout();
        navigate('/', { replace: true });
    };

    const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <>
            <header className="app-navbar">
                <div className="navbar-inner">
                    <div className="brand-wrap">
                        <Link to="/" className="brand-link" title="Shortly - Home">
                            <span className="brand-text">Shortly</span>
                        </Link>
                    </div>

                    <div className="navbar-right">

                        {/* Guest state: Sign In & Register */}
                        {!isAuthenticated ? (
                            <div className="guest-nav-links">
                                <Link to="/login" className="nav-btn nav-link-btn" title="Sign In">
                                    <span>Sign in</span>
                                </Link>
                                <Link
                                    to="/register"
                                    className="nav-btn nav-link-btn primary"
                                    title="Create an account"
                                >
                                    <span>Register</span>
                                </Link>
                            </div>
                        ) : (
                            /* Authenticated state: Avatar with Dropdown */
                            <div className="user-menu-container" ref={menuRef}>
                                <button
                                    type="button"
                                    className={`avatar-trigger-btn ${isMenuOpen ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen((prev) => !prev)}
                                    title={`Account menu (${user?.username || 'User'})`}
                                    aria-haspopup="true"
                                    aria-expanded={isMenuOpen}
                                >
                                    <div className={`avatar-icon-box ${user?.profilePicture ? 'has-image' : ''}`}>
                                        {user?.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user?.username || 'Avatar'}
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <User size={15} />
                                        )}
                                    </div>
                                    <ChevronDown
                                        size={13}
                                        className={`chevron-icon ${isMenuOpen ? 'open' : ''}`}
                                    />
                                </button>

                                {isMenuOpen && (
                                    <div className="user-dropdown-card" role="menu">
                                        <div className="dropdown-user-info">
                                            <div className={`mini-avatar ${user?.profilePicture ? 'has-image' : ''}`}>
                                                {user?.profilePicture ? (
                                                    <img
                                                        src={user.profilePicture}
                                                        alt={user?.username || 'Avatar'}
                                                        referrerPolicy="no-referrer"
                                                    />
                                                ) : (
                                                    initial
                                                )}
                                            </div>
                                            <div className="mini-user-text">
                                                <span className="name">{user?.username}</span>
                                                <span className="email">
                                                    {user?.email || 'Logged in'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="dropdown-divider" />

                                        <button
                                            type="button"
                                            className="dropdown-item"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsAccountModalOpen(true);
                                            }}
                                            role="menuitem"
                                        >
                                            <User size={15} />
                                            <span>My account</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="dropdown-item logout"
                                            onClick={handleLogout}
                                            role="menuitem"
                                        >
                                            <LogOut size={15} />
                                            <span>Log out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Account Profile Modal */}
            <AccountModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                user={user}
                onLogout={handleLogout}
            />
        </>
    );
};

export default Navbar;
