import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Resets scroll position to the top whenever the route changes.
 *
 * React Router doesn't reset scroll on navigation by default, so without this
 * a user who scrolls halfway down the homepage and then opens an event lands
 * on the new page already scrolled down. We skip the reset on POP navigation
 * (back/forward button) so the browser's native scroll restoration can put
 * the user back where they were.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
