import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedPage } from '@/components/AnimatedPage';
import { motion } from 'framer-motion';
import { Ticket, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    const ok = login(email, password);
    if (ok) navigate('/');
    else setError('Login failed');
  };

  return (
    <AnimatedPage className="min-h-screen flex pt-16">
      {/* Left atmospheric panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{
        background: 'hsla(225, 30%, 5%, 0.9)',
      }}>
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full opacity-[0.12] blur-3xl animate-pulse-glow"
          style={{ background: 'hsl(265, 90%, 65%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] rounded-full opacity-[0.08] blur-3xl animate-pulse-glow"
          style={{ background: 'hsl(15, 90%, 62%)', animationDelay: '2s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />

        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'var(--gradient-primary)', boxShadow: '0 0 40px -5px hsla(265, 90%, 65%, 0.4)' }}>
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-heading text-4xl font-extrabold mb-4">
            <span className="gradient-text">EventX</span>
          </h2>
          {/* This panel is a deliberate dark brand accent within the light
              theme, so its body copy is hardcoded light rather than using
              the (now dark) --muted-foreground token. */}
          <p className="text-lg leading-relaxed max-w-sm mx-auto" style={{ color: 'hsla(220, 20%, 92%, 0.75)' }}>
            Book event tickets with lightning-fast concurrency. Your next unforgettable experience awaits.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.04), transparent 60%)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--gradient-primary)' }}>
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold gradient-text">EventX</span>
          </div>

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-extrabold mb-2">Welcome back</h1>
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

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              Sign In <ArrowRight className="w-4 h-4" />
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
              Demo accounts
            </p>
            <div className="space-y-1 text-muted-foreground text-xs">
              <p>User: <span className="font-mono text-primary">alex@example.com</span></p>
              <p>Admin: <span className="font-mono text-primary">admin@example.com</span></p>
              <p className="italic pt-1">Any password works</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default LoginPage;
