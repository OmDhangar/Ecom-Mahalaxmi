import api from './api';

export const getTestimonials = async () => {
  try {
    const response = await api.get('/api/common/testimonials');
    return response.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};