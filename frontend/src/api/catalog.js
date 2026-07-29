import api from './axios';

export const getBrands = (params) => api.get('/brands/', { params });
export const createBrand = (data) => api.post('/brands/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateBrand = (id, data) => api.patch(`/brands/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteBrand = (id) => api.delete(`/brands/${id}/`);

export const getCategories = (params) => api.get('/categories/', { params });
export const createCategory = (data) => api.post('/categories/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCategory = (id, data) => api.patch(`/categories/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCategory = (id) => api.delete(`/categories/${id}/`);

export const getProducts = (params) => api.get('/products/', { params });
export const getProduct = (id) => api.get(`/products/${id}/`);
export const createProduct = (data) => api.post('/products/', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateProduct = (id, data) => api.patch(`/products/${id}/`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteProduct = (id) => api.delete(`/products/${id}/`);
