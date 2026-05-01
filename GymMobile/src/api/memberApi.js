import api from './axiosInstance';

export function getProfile() {
  return api.get('/members/profile');
}

export function updateProfile(body) {
  return api.put('/members/profile', body);
}

export function calculateBmi(body) {
  return api.post('/members/bmi', body);
}
