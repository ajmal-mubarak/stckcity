import api from './axios';

export const downloadOrdersPDF = (params) =>
  api.get('/reports/orders/pdf/', { params, responseType: 'blob' });

export const downloadOrdersExcel = (params) =>
  api.get('/reports/orders/excel/', { params, responseType: 'blob' });

export const downloadShopHistoryPDF = (shopId, params) =>
  api.get(`/reports/shops/${shopId}/history/pdf/`, { params, responseType: 'blob' });

export const downloadShopHistoryExcel = (shopId, params) =>
  api.get(`/reports/shops/${shopId}/history/excel/`, { params, responseType: 'blob' });

export const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
