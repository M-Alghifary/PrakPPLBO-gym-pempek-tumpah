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
