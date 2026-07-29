import api from './axios';

// Cart
export const getCart = () => api.get('/orders/cart/');
export const addToCart = (data) => api.post('/orders/cart/add/', data);
export const updateCartItem = (pk, data) => api.patch(`/orders/cart/items/${pk}/`, data);
export const removeCartItem = (pk) => api.delete(`/orders/cart/items/${pk}/delete/`);
export const clearCart = () => api.delete('/orders/cart/clear/');

// Shop orders
export const placeOrder = (data) => api.post('/orders/orders/place/', data);
export const getMyOrders = (params) => api.get('/orders/orders/my/', { params });
export const getOrderDetail = (pk) => api.get(`/orders/orders/${pk}/`);
export const cancelOrder = (pk) => api.post(`/orders/orders/${pk}/cancel/`);

// Admin orders
export const getAdminOrders = (params) => api.get('/orders/admin/orders/', { params });
export const updateOrderStatus = (pk, data) => api.patch(`/orders/admin/orders/${pk}/status/`, data);
