import { Link } from 'react-router-dom';
import { Ticket, Github, Twitter, Instagram, ArrowUpRight } from 'lucide-react';

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Github, href: '#', label: 'GitHub' },
];

const Footer = () => {
  return (
    <footer className="relative border-t overflow-hidden" style={{
      borderColor: 'hsl(var(--border))',
      background: 'hsl(var(--secondary))',
    }}>
      {/* Mesh gradient decoration */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 40% 60% at 10% 100%, hsl(var(--primary) / 0.05), transparent),
          radial-gradient(ellipse 30% 50% at 90% 80%, hsl(var(--accent) / 0.04), transparent)
        `,
      }} />

      <div className="container mx-auto px-4 py-14 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-shadow duration-300 group-hover:shadow-glow"
                style={{ background: 'var(--gradient-primary)' }}>
                <Ticket className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading text-xl font-bold gradient-text">EventX</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
              Book event tickets with lightning-fast concurrency. No double bookings. No stress. Just seamless experiences.
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground transition-all duration-300 hover:text-white hover:shadow-glow"
                  style={{ border: '1px solid hsl(var(--border))' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--gradient-primary)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = '';
                    (e.currentTarget as HTMLElement).style.borderColor = 'hsl(var(--border))';
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-5 text-foreground">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Browse Events', to: '/' },
                { label: 'My Dashboard', to: '/dashboard' },
                { label: 'Sign In', to: '/login' },
                { label: 'Create Account', to: '/signup' },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold mb-5 text-foreground">Categories</h4>
            <ul className="space-y-3 text-sm">
              {['Music', 'Tech', 'Comedy', 'Film', 'Food'].map(cat => (
                <li key={cat}>
                  <span className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
                    {cat} Events
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold mb-5 text-foreground">Support</h4>
            <ul className="space-y-3 text-sm">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(item => (
                <li key={item}>
                  <span className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{
          borderTop: '1px solid hsl(var(--border))',
        }}>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EventX. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            Built with
            <span className="gradient-text font-medium">React</span>
            <span>·</span>
            <span className="gradient-text-accent font-medium">TailwindCSS</span>
            <span>·</span>
            <span className="text-primary font-medium">Framer Motion</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
