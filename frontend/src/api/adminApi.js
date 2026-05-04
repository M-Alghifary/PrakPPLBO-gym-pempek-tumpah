import axiosInstance from './axiosInstance';

// Get all members untuk admin
export const getAllMembers = async () => {
  try {
    const response = await axiosInstance.get('/admin/members');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

// Get stats/dashboard data
export const getAdminStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Get today's check-ins
export const getTodayCheckins = async () => {
  try {
    const response = await axiosInstance.get('/admin/checkins/today');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching today checkins:', error);
    throw error;
  }
};

// Update member role
export const updateMemberRole = async (userId, role) => {
  try {
    const response = await axiosInstance.put(`/admin/members/${userId}/role`, null, {
      params: { role }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

// Delete member
export const deleteMember = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/admin/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

// Get classes
export const getAllClasses = async () => {
  try {
    const response = await axiosInstance.get('/admin/classes');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

// Get all trainers untuk assign ke kelas
export const getAllTrainers = async () => {
  try {
    const response = await axiosInstance.get('/admin/trainers');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching trainers:', error);
    throw error;
  }
};

// Create new class dengan trainer
export const createClass = async (classData) => {
  try {
    const response = await axiosInstance.post('/schedule/classes', classData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

// Update kelas
export const updateClass = async (classId, classData) => {
  try {
    const response = await axiosInstance.put(`/admin/classes/${classId}`, classData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating class:', error);
    throw error;
  }
};

// Delete kelas
export const deleteClass = async (classId) => {
  try {
    const response = await axiosInstance.delete(`/admin/classes/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};

// Get all classes untuk admin
export const getAdminAllClasses = async () => {
  try {
    const response = await axiosInstance.get('/schedule/classes');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all classes:', error);
    throw error;
  }
};
