import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedPage } from '@/components/AnimatedPage';
import { motion } from 'framer-motion';
import { Ticket, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSubmitting(true);
    const result = await signup(name.trim(), email.trim(), password);
    setSubmitting(false);
    if (result.success) navigate('/');
    else setError(result.error || 'Sign up failed');
  };

  return (
    <AnimatedPage className="min-h-screen flex pt-16">
      {/* Left atmospheric panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{
        background: 'hsla(225, 30%, 5%, 0.9)',
      }}>
        {/* Animated orbs */}
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full opacity-[0.1] blur-3xl animate-pulse-glow"
          style={{ background: 'hsl(350, 65%, 46%)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] rounded-full opacity-[0.08] blur-3xl animate-pulse-glow"
          style={{ background: 'hsl(38, 80%, 50%)', animationDelay: '2s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />

        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'var(--gradient-accent)', boxShadow: '0 0 40px -5px hsla(350, 65%, 46%, 0.4)' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          {/* Deliberate dark brand panel within the light theme (see note
              below) — hardcode a light wordmark instead of the (now dark)
              --foreground token. */}
          <h2 className="font-heading text-4xl font-extrabold mb-4" style={{ color: '#fff' }}>Join EventX</h2>
          {/* Deliberate dark brand panel within the light theme — hardcode
              light copy instead of the (now dark) --muted-foreground token. */}
          <p className="text-lg leading-relaxed max-w-sm mx-auto" style={{ color: 'hsla(220, 20%, 92%, 0.75)' }}>
            Create your account and start booking tickets to the most exciting events around you.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 70%, hsl(var(--accent) / 0.04), transparent 60%)',
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
              style={{ background: 'var(--gradient-accent)' }}>
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">EventX</span>
          </div>

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-extrabold mb-2">Create account</h1>
            <p className="text-muted-foreground">Join EventX and start booking</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold mb-2 block text-foreground">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                className="input-glass"
                placeholder="Your name"
              />
            </div>
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
                  placeholder="At least 8 characters"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'var(--gradient-accent)',
                boxShadow: '0 4px 15px -3px hsla(350, 65%, 46%, 0.4)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 25px -3px hsla(350, 65%, 46%, 0.55)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 15px -3px hsla(350, 65%, 46%, 0.4)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {submitting ? 'Creating account...' : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default SignupPage;
