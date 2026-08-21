import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '@/components/AnimatedPage';
import { motion } from 'framer-motion';
import { Home, ArrowRight } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <AnimatedPage className="min-h-screen flex items-center justify-center px-6 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-sm"
      >
        <p
          className="font-display text-[7rem] sm:text-[9rem] leading-none tracking-tight text-foreground/90 select-none"
        >
          404
        </p>
        <div className="w-10 h-px bg-border mx-auto my-6" />
        <h1 className="font-heading text-lg font-semibold mb-2">Page not found</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          That page doesn't exist, or it moved. Let's get you back to the lineup.
        </p>
        <button
          onClick={() => navigate('/events')}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Back to events <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatedPage>
  );
};

export default NotFound;
