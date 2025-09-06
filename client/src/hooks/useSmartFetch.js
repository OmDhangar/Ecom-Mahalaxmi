import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isCacheFresh, shouldRevalidate } from '@/utils/cacheUtils';

/**
 * Smart data fetching hook
 * Implements conditional fetching, background updates, and intelligent caching
 */
export const useSmartFetch = ({
  action,
  actionParams = {},
  dependencies = [],
  cacheType = 'GENERAL',
  enableBackgroundRefresh = true,
  refetchOnWindowFocus = false,
  refetchInterval = null
}) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);
  const lastFetchRef = useRef(null);
  
  /**
   * Conditional fetch - only fetch if data is stale or missing
   */
  const conditionalFetch = useCallback(async (forceRefresh = false) => {
    const state = store.getState();
    
    // Get the appropriate slice state based on action
    let sliceState;
    const actionType = action.type;
    
    if (actionType.includes('shopProducts')) {
      sliceState = state.shopProducts;
    } else if (actionType.includes('shopCarousel')) {
      sliceState = state.shopCarousel;
    } else if (actionType.includes('adminProducts')) {
      sliceState = state.adminProducts;
    }
    
    if (!sliceState) {
      console.warn(`Could not determine slice state for action: ${actionType}`);
      return dispatch(action(actionParams));
    }
    
    // Don't fetch if currently loading
    if (sliceState.isLoading && !forceRefresh) {
      console.log('Skipping fetch - already loading');
      return;
    }
    
    // Check cache freshness
    const lastFetched = sliceState.lastFetched?.products || 
                       sliceState.lastFetched?.featured || 
                       sliceState.lastFetched ||
                       lastFetchRef.current;
    
    const shouldFetch = forceRefresh || 
                       !lastFetched || 
                       !isCacheFresh(lastFetched, cacheType);
    
    if (!shouldFetch) {
      console.log(`Smart fetch: Using cached data for ${actionType}`);\n      return;\n    }\n    \n    console.log(`Smart fetch: Fetching fresh data for ${actionType}`);\n    lastFetchRef.current = Date.now();\n    return dispatch(action(actionParams));\n  }, [action, actionParams, cacheType]);\n  \n  /**\n   * Background refresh - fetch fresh data in background if cache is getting stale\n   */\n  const backgroundRefresh = useCallback(async () => {\n    if (!enableBackgroundRefresh) return;\n    \n    const state = store.getState();\n    let sliceState;\n    const actionType = action.type;\n    \n    if (actionType.includes('shopProducts')) {\n      sliceState = state.shopProducts;\n    } else if (actionType.includes('shopCarousel')) {\n      sliceState = state.shopCarousel;\n    } else if (actionType.includes('adminProducts')) {\n      sliceState = state.adminProducts;\n    }\n    \n    if (!sliceState) return;\n    \n    const lastFetched = sliceState.lastFetched?.products || \n                       sliceState.lastFetched?.featured || \n                       sliceState.lastFetched ||\n                       lastFetchRef.current;\n    \n    if (lastFetched && shouldRevalidate(lastFetched, cacheType)) {\n      console.log(`Background refresh: Updating stale data for ${actionType}`);\n      dispatch(action(actionParams));\n    }\n  }, [action, actionParams, cacheType, enableBackgroundRefresh]);\n  \n  /**\n   * Handle window focus - optionally refetch when user returns to tab\n   */\n  useEffect(() => {\n    if (!refetchOnWindowFocus) return;\n    \n    const handleFocus = () => {\n      // Wait a bit to avoid rapid refetches\n      setTimeout(() => {\n        backgroundRefresh();\n      }, 1000);\n    };\n    \n    window.addEventListener('focus', handleFocus);\n    return () => window.removeEventListener('focus', handleFocus);\n  }, [refetchOnWindowFocus, backgroundRefresh]);\n  \n  /**\n   * Setup interval for periodic refresh\n   */\n  useEffect(() => {\n    if (!refetchInterval) return;\n    \n    intervalRef.current = setInterval(() => {\n      backgroundRefresh();\n    }, refetchInterval);\n    \n    return () => {\n      if (intervalRef.current) {\n        clearInterval(intervalRef.current);\n      }\n    };\n  }, [refetchInterval, backgroundRefresh]);\n  \n  /**\n   * Initial fetch and dependency-based refetch\n   */\n  useEffect(() => {\n    conditionalFetch();\n  }, dependencies);\n  \n  /**\n   * Background refresh on mount (after initial fetch)\n   */\n  useEffect(() => {\n    // Schedule background refresh after a delay\n    const timer = setTimeout(() => {\n      backgroundRefresh();\n    }, 5000); // 5 second delay\n    \n    return () => clearTimeout(timer);\n  }, []);\n  \n  return {\n    refetch: () => conditionalFetch(true),\n    backgroundRefresh,\n    conditionalFetch\n  };\n};\n\n/**\n * Hook for smart product fetching\n */\nexport const useSmartProductFetch = (filterParams = {}, sortParams = '') => {\n  const dispatch = useDispatch();\n  const { productList, isLoading, lastFetched } = useSelector(state => state.shopProducts);\n  \n  const { refetch, backgroundRefresh } = useSmartFetch({\n    action: (params) => {\n      const { fetchAllFilteredProducts } = require('@/store/shop/products-slice');\n      return fetchAllFilteredProducts(params);\n    },\n    actionParams: { filterParams, sortParams },\n    dependencies: [JSON.stringify(filterParams), sortParams],\n    cacheType: 'PRODUCTS',\n    enableBackgroundRefresh: true,\n    refetchOnWindowFocus: true\n  });\n  \n  return {\n    products: productList,\n    isLoading,\n    lastFetched: lastFetched?.products,\n    refetch,\n    backgroundRefresh\n  };\n};\n\n/**\n * Hook for smart featured products fetching\n */\nexport const useSmartFeaturedFetch = () => {\n  const dispatch = useDispatch();\n  const { featuredList, isLoading, lastFetched } = useSelector(state => state.shopProducts);\n  \n  const { refetch, backgroundRefresh } = useSmartFetch({\n    action: () => {\n      const { fetchFeaturedProducts } = require('@/store/shop/products-slice');\n      return fetchFeaturedProducts();\n    },\n    actionParams: {},\n    dependencies: [],\n    cacheType: 'FEATURED',\n    enableBackgroundRefresh: true,\n    refetchOnWindowFocus: false,\n    refetchInterval: 30 * 60 * 1000 // 30 minutes\n  });\n  \n  return {\n    featuredProducts: featuredList,\n    isLoading,\n    lastFetched: lastFetched?.featured,\n    refetch,\n    backgroundRefresh\n  };\n};\n\n/**\n * Hook for smart carousel fetching\n */\nexport const useSmartCarouselFetch = () => {\n  const dispatch = useDispatch();\n  const { activeSlides, isLoading, lastFetched } = useSelector(state => state.shopCarousel);\n  \n  const { refetch, backgroundRefresh } = useSmartFetch({\n    action: () => {\n      const { fetchActiveCarouselSlides } = require('@/store/shop/carousel-slice');\n      return fetchActiveCarouselSlides();\n    },\n    actionParams: {},\n    dependencies: [],\n    cacheType: 'CAROUSEL',\n    enableBackgroundRefresh: true,\n    refetchOnWindowFocus: false,\n    refetchInterval: 60 * 60 * 1000 // 1 hour\n  });\n  \n  return {\n    carouselSlides: activeSlides,\n    isLoading,\n    lastFetched,\n    refetch,\n    backgroundRefresh\n  };\n};\n\n/**\n * Hook for pagination with caching\n */\nexport const useSmartPagination = ({\n  fetchAction,\n  baseParams = {},\n  pageSize = 20,\n  cacheType = 'GENERAL'\n}) => {\n  const [currentPage, setCurrentPage] = useState(1);\n  const [allData, setAllData] = useState([]);\n  const [hasMore, setHasMore] = useState(true);\n  const cacheRef = useRef(new Map());\n  \n  const fetchPage = useCallback(async (page) => {\n    // Check cache first\n    const cacheKey = `page_${page}_${JSON.stringify(baseParams)}`;\n    const cached = cacheRef.current.get(cacheKey);\n    \n    if (cached && isCacheFresh(cached.timestamp, cacheType)) {\n      console.log(`Using cached page ${page}`);\n      return cached.data;\n    }\n    \n    // Fetch from API\n    const params = {\n      ...baseParams,\n      page,\n      limit: pageSize\n    };\n    \n    const result = await dispatch(fetchAction(params));\n    \n    // Cache the result\n    cacheRef.current.set(cacheKey, {\n      data: result.payload,\n      timestamp: Date.now()\n    });\n    \n    return result.payload;\n  }, [baseParams, pageSize, cacheType, fetchAction, dispatch]);\n  \n  const loadMore = useCallback(async () => {\n    const nextPage = currentPage + 1;\n    const pageData = await fetchPage(nextPage);\n    \n    if (pageData && pageData.length > 0) {\n      setAllData(prev => [...prev, ...pageData]);\n      setCurrentPage(nextPage);\n      setHasMore(pageData.length === pageSize);\n    } else {\n      setHasMore(false);\n    }\n  }, [currentPage, fetchPage, pageSize]);\n  \n  const reset = useCallback(() => {\n    setCurrentPage(1);\n    setAllData([]);\n    setHasMore(true);\n    cacheRef.current.clear();\n  }, []);\n  \n  // Initial load\n  useEffect(() => {\n    fetchPage(1).then(data => {\n      if (data && data.length > 0) {\n        setAllData(data);\n        setHasMore(data.length === pageSize);\n      }\n    });\n  }, [fetchPage, pageSize]);\n  \n  return {\n    data: allData,\n    currentPage,\n    hasMore,\n    loadMore,\n    reset\n  };\n};
