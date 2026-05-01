import api from './axiosInstance';

export function getClasses() {
  return api.get('/schedule/classes');
}

export function getMyBookings() {
  return api.get('/schedule/my-bookings');
}

export function bookClass(classId) {
  return api.post(`/schedule/classes/${classId}/book`);
}

export function cancelBooking(classId) {
  return api.put(`/schedule/classes/${classId}/cancel`);
}

export function scanAttendance(classId) {
  return api.post(`/attendance/scan/${classId}`);
}
