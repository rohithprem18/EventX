import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '@/components/AnimatedPage';
import { motion } from 'framer-motion';
import { Home, ArrowRight } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <AnimatedPage className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-3xl animate-pulse-glow"
          style={{ background: 'hsl(38, 80%, 50%)' }} />
        <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] rounded-full opacity-[0.04] blur-3xl animate-pulse-glow"
          style={{ background: 'hsl(350, 65%, 46%)', animationDelay: '2s' }} />
      </div>

      <div className="text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <motion.h1
            className="font-display text-7xl sm:text-8xl font-black leading-none text-primary select-none"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            404
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="font-display text-2xl font-bold mb-3">Page not found</h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to Events <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default NotFound;
