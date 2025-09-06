import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import store from '@/store/store';
import { isCacheFresh, shouldRevalidate } from '@/utils/cacheUtils';

/**
 * Hook for smart featured products fetching
 */
export const useSmartFeaturedFetch = () => {
  const dispatch = useDispatch();
  const { featuredList, isLoading, lastFetched } = useSelector(state => state.shopProducts);
  
  const fetchIfNeeded = useCallback(() => {
    const shouldFetch = !lastFetched?.featured || !isCacheFresh(lastFetched.featured, 'FEATURED');
    
    if (shouldFetch && !isLoading) {
      console.log('Fetching featured products');
      const { fetchFeaturedProducts } = require('@/store/shop/products-slice');
      dispatch(fetchFeaturedProducts());
    } else if (!shouldFetch) {
      console.log('Using cached featured products');
    }
  }, [dispatch, lastFetched, isLoading]);
  
  // Initial fetch
  useEffect(() => {
    fetchIfNeeded();
  }, []);
  
  // Background refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastFetched?.featured && shouldRevalidate(lastFetched.featured, 'FEATURED')) {
        console.log('Background refresh: Featured products');
        const { fetchFeaturedProducts } = require('@/store/shop/products-slice');
        dispatch(fetchFeaturedProducts());
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(interval);
  }, [dispatch, lastFetched]);
  
  return {
    featuredProducts: featuredList,
    isLoading,
    lastFetched: lastFetched?.featured,
    refetch: fetchIfNeeded
  };
};

/**
 * Hook for smart carousel fetching
 */
export const useSmartCarouselFetch = () => {
  const dispatch = useDispatch();
  const { activeSlides, isLoading, lastFetched } = useSelector(state => state.shopCarousel);
  
  const fetchIfNeeded = useCallback(() => {
    const shouldFetch = !lastFetched || !isCacheFresh(lastFetched, 'CAROUSEL');
    
    if (shouldFetch && !isLoading) {
      console.log('Fetching carousel slides');
      const { fetchActiveCarouselSlides } = require('@/store/shop/carousel-slice');
      dispatch(fetchActiveCarouselSlides());
    } else if (!shouldFetch) {
      console.log('Using cached carousel slides');
    }
  }, [dispatch, lastFetched, isLoading]);
  
  // Initial fetch
  useEffect(() => {
    fetchIfNeeded();
  }, []);
  
  // Background refresh every hour
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastFetched && shouldRevalidate(lastFetched, 'CAROUSEL')) {
        console.log('Background refresh: Carousel slides');
        const { fetchActiveCarouselSlides } = require('@/store/shop/carousel-slice');
        dispatch(fetchActiveCarouselSlides());
      }
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }, [dispatch, lastFetched]);
  
  return {
    carouselSlides: activeSlides,
    isLoading,
    lastFetched,
    refetch: fetchIfNeeded
  };
};

/**
 * Hook for smart product fetching with filters
 */
export const useSmartProductFetch = (filterParams = {}, sortParams = '') => {
  const dispatch = useDispatch();
  const { productList, isLoading, lastFetched, cacheKeys } = useSelector(state => state.shopProducts);
  
  const fetchIfNeeded = useCallback(() => {
    // Generate current cache key
    const currentKey = JSON.stringify({ filterParams, sortParams });
    
    // Check if we need to fetch
    const shouldFetch = !lastFetched?.products || 
                       !isCacheFresh(lastFetched.products, 'PRODUCTS') ||
                       cacheKeys?.products !== currentKey;
    
    if (shouldFetch && !isLoading) {
      console.log('Fetching filtered products');
      const { fetchAllFilteredProducts } = require('@/store/shop/products-slice');
      dispatch(fetchAllFilteredProducts({ filterParams, sortParams }));
    } else if (!shouldFetch) {
      console.log('Using cached filtered products');
    }
  }, [dispatch, filterParams, sortParams, lastFetched, cacheKeys, isLoading]);
  
  // Fetch when dependencies change
  useEffect(() => {
    fetchIfNeeded();
  }, [fetchIfNeeded]);
  
  // Background refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (lastFetched?.products && shouldRevalidate(lastFetched.products, 'PRODUCTS')) {
        setTimeout(() => {
          console.log('Background refresh: Filtered products (window focus)');
          const { fetchAllFilteredProducts } = require('@/store/shop/products-slice');
          dispatch(fetchAllFilteredProducts({ filterParams, sortParams }));
        }, 1000);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch, filterParams, sortParams, lastFetched]);
  
  return {
    products: productList,
    isLoading,
    lastFetched: lastFetched?.products,
    refetch: fetchIfNeeded
  };
};
