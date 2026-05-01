import api from './axiosInstance';

export function getPaymentHistory() {
  return api.get('/payments/history');
}

export function initiatePayment(packageId, body) {
  return api.post(`/payments/initiate/${packageId}`, body);
}

export function confirmPayment(paymentId) {
  return api.post(`/payments/confirm/${paymentId}`);
}
