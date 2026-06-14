import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  // Handle smooth scroll to hash targets after navigation
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [location]);

  const handleHashClick = (e, to) => {
    e.preventDefault();
    const [path, hash] = to.split('#');
    const targetPath = path || '/';

    if (location.pathname === targetPath) {
      // Already on the page, just scroll
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Navigate then scroll
      navigate(targetPath + '#' + hash);
    }
    setMenuOpen(false);
  };

  const renderNavItem = (item, isMobile = false) => {
    const { to, label, isHash } = item;

    if (isHash) {
      return (
        <a
          key={to}
          href={to}
          onClick={(e) => handleHashClick(e, to)}
          className={
            isMobile
              ? 'block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 text-surface-600 hover:bg-surface-50'
              : 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-surface-600 hover:text-surface-900 hover:bg-surface-100'
          }
        >
          {label}
        </a>
      );
    }

    return (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          isMobile
            ? `block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive ? 'bg-brand-50 text-brand-600' : 'text-surface-600 hover:bg-surface-50'
              }`
            : `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
              }`
        }
      >
        {label}
      </NavLink>
    );
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-surface-100'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-white font-display text-sm group-hover:bg-brand-700 transition-colors duration-200">
              JN
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-surface-900 text-[15px]">Jaswanth Narne</span>
              <span className="block text-[11px] text-brand-600 font-semibold -mt-0.5">EdTech & Corporate Trainer</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => renderNavItem(item))}
          </div>

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-surface-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden card mb-4 p-2 animate-slide-down">
            {navLinks.map((item) => renderNavItem(item, true))}
          </div>
        )}
      </div>
    </nav>
  );
}
