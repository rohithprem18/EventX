import { Link } from 'react-router-dom';
import { Ticket, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Ticket className="w-6 h-6 text-primary" />
              <span className="font-heading text-xl font-bold gradient-text">EventX</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Book event tickets with lightning-fast concurrency. No double bookings. No stress.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Github, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Browse Events', to: '/' },
                { label: 'My Dashboard', to: '/dashboard' },
                { label: 'Sign In', to: '/login' },
                { label: 'Create Account', to: '/signup' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {['Music', 'Tech', 'Comedy', 'Film', 'Food'].map(cat => (
                <li key={cat}>
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {cat} Events
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(item => (
                <li key={item}>
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EventX. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with React, TailwindCSS & Framer Motion
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
