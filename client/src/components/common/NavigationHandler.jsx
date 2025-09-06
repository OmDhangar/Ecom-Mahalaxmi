import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBrowserBackButton } from '@/hooks/useBackNavigation';

/**
 * Global Navigation Handler Component
 * Handles browser/phone back button for the entire app
 */
const NavigationHandler = ({ children }) => {
  const location = useLocation();
  
  // Enable browser/phone back button handling globally
  useBrowserBackButton('/');

  useEffect(() => {
    // Add history state to enable proper back button behavior
    if (window.history.state === null) {
      window.history.replaceState({ path: location.pathname }, '', location.pathname);
    }
  }, [location.pathname]);

  return children;
};

export default NavigationHandler;
