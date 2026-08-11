import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, LayoutGrid, User, FileText, Briefcase, Folder, Heart, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const allUserMenuItems = [
  { to: '/dashboard?tab=overview', label: 'Dashboard', icon: LayoutGrid, id: 'nav-dropdown-overview', roles: ['candidate', 'employer'] },
  { to: '/dashboard?tab=profile', label: 'My Profile', icon: User, id: 'nav-dropdown-profile', roles: ['candidate', 'employer'] },
  { to: '/dashboard?tab=my-jobs', label: 'My Jobs', icon: Briefcase, id: 'nav-dropdown-my-jobs', roles: ['employer'] },
  { to: '/dashboard?tab=resume', label: 'My Resume', icon: FileText, id: 'nav-dropdown-resume', roles: ['candidate'] },
  { to: '/dashboard?tab=applications', label: 'Applied Jobs', icon: Briefcase, id: 'nav-dropdown-applications', roles: ['candidate'] },
  { to: '/dashboard?tab=cv-manager', label: 'CV Manager', icon: Folder, id: 'nav-dropdown-cv-manager', roles: ['candidate'] },
  { to: '/dashboard?tab=saved', label: 'Favorite jobs', icon: Heart, id: 'nav-dropdown-saved', roles: ['candidate'] },
  { to: '/dashboard?tab=change-password', label: 'Change Password', icon: Lock, id: 'nav-dropdown-change-password', roles: ['candidate', 'employer'] },
];

export default function Navbar() {
  const { isAuthenticated: isLoggedIn, logout, user, role } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab') || 'overview';

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80";
    if (avatarPath.startsWith('http')) return avatarPath;
    const serverOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
    return `${serverOrigin}${cleanPath}`;
  };

  const avatar = getAvatarUrl(user?.avatar);

  const userMenuItems = allUserMenuItems.filter(item => item.roles.includes(role));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // 'roles' = which logged-in roles see this link.
  // undefined means visible to everyone (logged-in & logged-out, all roles).
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/candidates', label: 'Candidates' },
    // Only employers see "Post your Vacancy" when logged in
    { to: '/post-vacancy', label: 'Post your Vacancy', roles: ['employer'] },
    // Only candidates see "Create My CV" when logged in
    { to: '/dashboard?tab=resume', label: 'Create My CV', roles: ['candidate'] },
    { to: '/about', label: 'About us' },
    { to: '/contact', label: 'Contact us' },
  ];

  // When logged in, filter by role; when logged out, show all links
  const visibleNavLinks = isLoggedIn
    ? navLinks.filter(link => !link.roles || link.roles.includes(role))
    : navLinks;

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''} ${isLoggedIn ? 'navbar--logged-in' : ''}`} id="main-navbar">
      <div className="navbar__container container">
        {isLoggedIn ? (
          <>
            {/* Single Row Logged In Layout */}
            <div className="navbar__logged-in-row">
              <Link to="/" className="navbar__logo" id="nav-logo">
                <span className="navbar__logo-text">
                  <span className="navbar__logo-job">JOB</span><span className="navbar__logo-zone">ZONE</span>
                </span>
              </Link>

              <div className="navbar__logged-in-links">
                {visibleNavLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`navbar__link ${
                      location.pathname === link.to.split('#')[0] ? 'navbar__link--active' : ''
                    }`}
                    id={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="navbar__logged-in-actions">
                {/* Notifications Bell */}
                <Link to="/dashboard" className="navbar__bell-btn" id="nav-bell" aria-label="Notifications">
                  <Bell size={20} />
                  <span className="navbar__bell-badge">0</span>
                </Link>

                <div className="navbar__user-wrapper">
                  <button
                    className="navbar__user-btn-avatar-only"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    id="nav-user-menu-btn"
                    aria-label="User menu"
                  >
                    <img
                      src={avatar}
                      alt="User Avatar"
                      className="navbar__user-avatar-img"
                    />
                  </button>
                  {showUserMenu && (
                    <div className="navbar__user-dropdown" id="nav-user-dropdown">
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        const itemTab = item.to.split('tab=')[1];
                        const isActive = location.pathname === '/dashboard' && currentTab === itemTab;
                        return (
                          <Link
                            key={item.label}
                            to={item.to}
                            className={`navbar__dropdown-item ${isActive ? 'navbar__dropdown-item--active' : ''}`}
                            id={item.id}
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Icon size={16} />
                            {item.label}
                          </Link>
                        );
                      })}
                      <div className="navbar__dropdown-divider" style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }} />
                      <button
                        onClick={handleLogout}
                        className="navbar__dropdown-item navbar__dropdown-item--logout"
                        id="nav-dropdown-logout"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Hamburger Button for Mobile */}
                <button
                  className="navbar__hamburger"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  id="nav-hamburger"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {/* Mobile Drawer Navigation Links */}
            <div className={`navbar__bottom-row ${isMobileMenuOpen ? 'navbar__bottom-row--open' : ''}`}>
              <div className="navbar__links">
                {visibleNavLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`navbar__link ${
                      location.pathname === link.to.split('#')[0] ? 'navbar__link--active' : ''
                    }`}
                    id={`nav-link-mobile-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="navbar__mobile-actions">
                  <Link to="/dashboard" className="btn btn-primary" id="nav-mobile-dashboard">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn btn-secondary" id="nav-mobile-logout">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Original Logged Out Layout */
          <>
            {/* Top Row: Logo & Utility Actions */}
            <div className="navbar__top-row">
              <Link to="/" className="navbar__logo" id="nav-logo">
                <span className="navbar__logo-text">
                  <span className="navbar__logo-job">JOB</span><span className="navbar__logo-zone">ZONE</span>
                </span>
              </Link>

              <div className="navbar__top-actions">
                {/* Notifications Bell */}
                <Link to="/dashboard" className="navbar__bell-btn" id="nav-bell" aria-label="Notifications">
                  <Bell size={20} />
                  <span className="navbar__bell-badge">0</span>
                </Link>

                <span className="navbar__divider">|</span>
                <Link to="/register" className="navbar__auth-link" id="nav-register">
                  Register
                </Link>
                <span className="navbar__divider">|</span>
                <Link to="/login" className="navbar__auth-link" id="nav-signin">
                  Sign In
                </Link>

                {/* Hamburger Button for Mobile */}
                <button
                  className="navbar__hamburger"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  id="nav-hamburger"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {/* Bottom Row: Navigation Links */}
            <div className={`navbar__bottom-row ${isMobileMenuOpen ? 'navbar__bottom-row--open' : ''}`}>
              <div className="navbar__links">
                {visibleNavLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`navbar__link ${
                      location.pathname === link.to.split('#')[0] ? 'navbar__link--active' : ''
                    }`}
                    id={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile actions inside the drawer */}
                <div className="navbar__mobile-actions">
                  <Link to="/login" className="btn btn-secondary" id="nav-mobile-login">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary" id="nav-mobile-register">
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {isMobileMenuOpen && <div className="navbar__overlay" onClick={() => setIsMobileMenuOpen(false)} />}
    </nav>
  );
}
