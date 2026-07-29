import api from './axios';

export const getShops = (status) =>
  api.get('/auth/shops/', { params: status ? { status } : {} });

export const updateShopStatus = (id, status) =>
  api.patch(`/auth/shops/${id}/status/`, { status });
