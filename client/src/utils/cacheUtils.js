/**
 * Cache utilities for Redux slices
 * Provides caching logic, timestamps, and conditional fetching
 */

const CACHE_DURATION = {
  PRODUCTS: 15 * 60 * 1000, // 15 minutes
  FEATURED: 30 * 60 * 1000, // 30 minutes  
  CAROUSEL: 60 * 60 * 1000, // 1 hour
  PRODUCT_DETAILS: 10 * 60 * 1000, // 10 minutes
  GENERAL: 15 * 60 * 1000, // 15 minutes
};

/**
 * Check if cached data is still fresh
 */
export const isCacheFresh = (timestamp, cacheType = 'GENERAL') => {
  if (!timestamp) return false;
  
  const now = Date.now();
  const duration = CACHE_DURATION[cacheType] || CACHE_DURATION.GENERAL;
  
  return (now - timestamp) < duration;
};

/**
 * Check if cache is stale but can be used while revalidating
 */
export const isCacheStale = (timestamp, cacheType = 'GENERAL') => {
  if (!timestamp) return true;
  
  const now = Date.now();
  const duration = CACHE_DURATION[cacheType] || CACHE_DURATION.GENERAL;
  const staleDuration = duration * 2; // Allow stale data for 2x the cache duration
  
  return (now - timestamp) > staleDuration;
};

/**
 * Generate cache key for filtered/sorted data
 */
export const generateCacheKey = (filters = {}, sort = '') => {
  const filterStr = Object.keys(filters)
    .sort()
    .map(key => `${key}:${JSON.stringify(filters[key])}`)
    .join('|');
  
  return `${filterStr}_${sort}`.trim();
};

/**
 * Create cache-aware action condition
 * Prevents duplicate API calls if data is fresh
 */
export const createCacheCondition = (cacheType = 'GENERAL') => {
  return (action, { getState }) => {
    const state = getState();
    
    // Get the appropriate slice state based on action type
    let sliceState;
    const actionType = action.type;
    
    if (actionType.includes('shopProducts')) {
      sliceState = state.shopProducts;
    } else if (actionType.includes('shopCarousel')) {
      sliceState = state.shopCarousel;
    } else if (actionType.includes('adminProducts')) {
      sliceState = state.adminProducts;
    } else {
      return true; // Allow action if we can't determine the slice
    }
    
    // Don't dispatch if currently loading
    if (sliceState.isLoading) {
      return false;
    }
    
    // Check if we have fresh cached data
    const lastFetched = sliceState.lastFetched || sliceState.timestamp;
    if (lastFetched && isCacheFresh(lastFetched, cacheType)) {
      console.log(`Cache HIT: Skipping API call for ${actionType}`);
      return false;
    }
    
    console.log(`Cache MISS: Allowing API call for ${actionType}`);
    return true;
  };
};

/**
 * Enhanced cache state manager
 */
export const createCacheEnhancedState = (initialState) => {
  return {
    ...initialState,
    lastFetched: null,
    cacheKey: null,
    isStale: false,
  };
};

/**
 * Cache-aware fulfilled reducer
 */
export const createCacheFulfilledReducer = (cacheType = 'GENERAL') => {
  return (state, action) => {
    state.isLoading = false;
    state.lastFetched = Date.now();
    state.isStale = false;
    
    // Handle different action payloads
    if (action.meta?.cacheKey) {
      state.cacheKey = action.meta.cacheKey;
    }
    
    return state;
  };
};

/**
 * Background revalidation utility
 */
export const shouldRevalidate = (timestamp, cacheType = 'GENERAL') => {
  if (!timestamp) return true;
  
  const now = Date.now();
  const duration = CACHE_DURATION[cacheType] || CACHE_DURATION.GENERAL;
  const revalidationPoint = duration * 0.75; // Revalidate at 75% of cache duration
  
  return (now - timestamp) > revalidationPoint;
};

/**
 * Local storage cache utilities
 */
export const localCache = {
  set: (key, data, cacheType = 'GENERAL') => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        cacheType
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  
  get: (key, cacheType = 'GENERAL') => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;
      
      const { data, timestamp, cacheType: storedType } = JSON.parse(cached);
      
      if (isCacheStale(timestamp, storedType || cacheType)) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return {
        data,
        timestamp,
        isStale: !isCacheFresh(timestamp, storedType || cacheType)
      };
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }
};

/**
 * Conditional fetch hook - can be used in components
 */
export const useConditionalFetch = () => {
  return {
    shouldFetch: (lastFetched, cacheType = 'GENERAL') => {
      return !lastFetched || !isCacheFresh(lastFetched, cacheType);
    },
    
    shouldRevalidateInBackground: (lastFetched, cacheType = 'GENERAL') => {
      return lastFetched && shouldRevalidate(lastFetched, cacheType);
    }
  };
};
