import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to handle back button navigation for browser and mobile devices
 * Provides proper history management and fallback navigation
 */
export const useBackNavigation = (fallbackRoute = '/') => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Store current page in navigation history
    const currentPath = location.pathname;
    const navigationHistory = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    
    // Add current path if it's not the same as the last one
    if (navigationHistory[navigationHistory.length - 1] !== currentPath) {
      navigationHistory.push(currentPath);
      
      // Keep only last 10 pages to prevent memory issues
      if (navigationHistory.length > 10) {
        navigationHistory.shift();
      }
      
      sessionStorage.setItem('navigationHistory', JSON.stringify(navigationHistory));
    }
  }, [location.pathname]);

  // Function to handle back navigation
  const handleBackNavigation = () => {
    const navigationHistory = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    
    if (navigationHistory.length > 1) {
      // Remove current page
      navigationHistory.pop();
      const previousPage = navigationHistory[navigationHistory.length - 1];
      
      // Update history
      sessionStorage.setItem('navigationHistory', JSON.stringify(navigationHistory));
      
      // Navigate to previous page
      navigate(previousPage, { replace: true });
    } else {
      // No history available, navigate to fallback
      navigate(fallbackRoute, { replace: true });
    }
  };

  // Function to get previous page
  const getPreviousPage = () => {
    const navigationHistory = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    return navigationHistory.length > 1 ? navigationHistory[navigationHistory.length - 2] : fallbackRoute;
  };

  // Function to clear navigation history
  const clearNavigationHistory = () => {
    sessionStorage.removeItem('navigationHistory');
  };

  return {
    handleBackNavigation,
    getPreviousPage,
    clearNavigationHistory
  };
};

/**
 * Hook specifically for handling browser/phone back button events
 */
export const useBrowserBackButton = (fallbackRoute = '/') => {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = (event) => {
      // Prevent default back behavior
      event.preventDefault();
      
      const navigationHistory = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
      
      if (navigationHistory.length > 1) {
        // Go to previous page in our custom history
        navigationHistory.pop(); // Remove current page
        const previousPage = navigationHistory[navigationHistory.length - 1];
        sessionStorage.setItem('navigationHistory', JSON.stringify(navigationHistory));
        navigate(previousPage, { replace: true });
      } else {
        // Navigate to fallback route
        navigate(fallbackRoute, { replace: true });
      }
    };

    // Add event listener for browser back button
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, fallbackRoute]);
};
