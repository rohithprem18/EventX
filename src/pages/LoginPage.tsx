import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedPage } from '@/components/AnimatedPage';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

// Seeded Picsum photograph, distinct from the signup panel's — a still
// frame rather than a decorative blur/orb treatment.
const panelImage = 'https://picsum.photos/seed/eventx-login-venue/1200/1600';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password) { setError('Password is required'); return; }
    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);
    if (result.success) navigate('/events');
    else setError(result.error || 'Login failed');
  };

  return (
    <AnimatedPage className="min-h-screen flex pt-16">
      {/* Left panel — a real still, not a decorative blur/orb treatment */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src={panelImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(200deg, hsl(201 55% 6% / 0.35) 0%, hsl(201 55% 6% / 0.85) 100%)',
        }} />
        <div className="relative z-10 h-full flex flex-col justify-end px-12 pb-16">
          <span
            className="text-2xl text-white/90 mb-6"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            EventX
          </span>
          <h2
            className="text-4xl leading-[1.05] text-white mb-4"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Your next unforgettable<br />night starts here.
          </h2>
          <p className="text-white/65 leading-relaxed max-w-sm">
            Real-time seat locking, zero double bookings, instant e-tickets. Sign back in to pick up where you left off.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <span
              className="text-2xl text-foreground"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              EventX
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your EventX account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold mb-2 block text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="input-glass"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="input-glass pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {submitting ? 'Signing in...' : (<>Sign in <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 p-4 rounded-xl text-sm" style={{
            background: 'hsl(var(--primary) / 0.06)',
            border: '1px solid hsl(var(--primary) / 0.12)',
          }}>
            <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
              Demo admin account
            </p>
            <div className="space-y-1 text-muted-foreground text-xs">
              <p>Email: <span className="font-mono text-primary">admin@example.com</span></p>
              <p>Password: <span className="font-mono text-primary">admin1234</span></p>
              <p className="pt-1">New here? <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link> instead.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default LoginPage;
