// @context: Scroll-to-top on route change
// @purpose: Scrolls window to top whenever the pathname changes (route navigation)
// @behavior: useEffect watches pathname; calls window.scrollTo(0,0) on every route change
// @dependencies: react-router-dom (useLocation)

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
