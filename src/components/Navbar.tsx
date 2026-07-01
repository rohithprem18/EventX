import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Ticket, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const links = (
    <>
      <Link to="/" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">Events</Link>
      {user && (
        <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
      )}
      {isAdmin && (
        <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: 'hsl(220 20% 97% / 0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Ticket className="w-6 h-6 text-primary" />
          <span className="font-heading text-xl font-bold gradient-text">EventX</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {user.name}
              </span>
              <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm !py-2 !px-4">Sign In</Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border"
            style={{ background: 'hsl(220 20% 97% / 0.95)' }}
          >
            <div className="flex flex-col gap-4 p-4">
              {links}
              {user ? (
                <button onClick={handleLogout} className="text-left text-muted-foreground hover:text-foreground transition-colors">Logout</button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center !py-2">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
