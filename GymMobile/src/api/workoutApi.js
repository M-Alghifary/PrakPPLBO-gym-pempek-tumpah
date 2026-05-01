import api from './axiosInstance';

export function getWorkoutLogs() {
  return api.get('/workout/logs');
}

export function addWorkoutLog(body) {
  return api.post('/workout/logs', body);
}

export function deleteWorkoutLog(id) {
  return api.delete(`/workout/logs/${id}`);
}
