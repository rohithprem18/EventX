import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 ${className}`}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label="Toggle color theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          {isDark ? <Moon className="w-[17px] h-[17px]" /> : <Sun className="w-[17px] h-[17px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Events', path: '/events' },
  { label: 'Dashboard', path: '/dashboard', auth: true },
  { label: 'Admin', path: '/admin', admin: true },
];

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // On the home page the nav starts fully transparent over the hero video
  // and only picks up the glass tint once the page scrolls past it. Every
  // other page has no video behind the bar, so it stays tinted from the
  // start — an always-transparent bar there would sit directly on body
  // content with no separation.
  const isHome = location.pathname === '/';

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const filteredLinks = navLinks.filter(link => {
    if (link.admin) return isAdmin;
    if (link.auth) return !!user;
    return true;
  });

  const tinted = scrolled || !isHome;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500"
      style={{
        background: tinted ? 'hsla(var(--glass-bg))' : 'transparent',
        backdropFilter: tinted ? 'blur(20px) saturate(1.4)' : 'none',
        WebkitBackdropFilter: tinted ? 'blur(20px) saturate(1.4)' : 'none',
        borderBottom: `1px solid ${tinted ? 'hsl(var(--border))' : 'transparent'}`,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-baseline gap-0.5 group shrink-0">
          <span
            className="text-2xl text-foreground tracking-tight"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            EventX
          </span>
          <sup className="text-[10px] text-primary translate-y-[-2px]">•</sup>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {filteredLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-sm transition-colors duration-200"
                style={{ color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1.5 left-0 right-0 h-px"
                    style={{ background: 'hsl(var(--primary))' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 pl-1 pr-3.5 py-1 rounded-full liquid-glass">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold"
                  style={{ background: 'var(--gradient-primary)', color: 'hsl(var(--primary-foreground))' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-foreground">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-300 hover:scale-[1.03]"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-foreground"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden overflow-hidden border-t"
            style={{
              background: 'hsl(var(--card) / 0.98)',
              backdropFilter: 'blur(20px)',
              borderColor: 'hsl(var(--border))',
            }}
          >
            <div className="flex flex-col gap-1 p-4">
              {filteredLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? 'text-foreground bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-2 mt-2 border-t border-border">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary text-sm text-center block !py-2.5"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
