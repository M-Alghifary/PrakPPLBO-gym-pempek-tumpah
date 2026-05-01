import api from './axiosInstance';

export function getPackages() {
  return api.get('/memberships/packages');
}

export function getActiveMembership() {
  return api.get('/memberships/active');
}

export function getMembershipHistory() {
  return api.get('/memberships/history');
}
