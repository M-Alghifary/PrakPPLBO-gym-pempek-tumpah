import axiosInstance from './axiosInstance';

// Get trainer's classes/schedule
export const getTrainerClasses = async () => {
  try {
    const response = await axiosInstance.get('/schedule/trainer/classes');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching trainer classes:', error);
    throw error;
  }
};

// Get class participants
export const getClassParticipants = async (classId) => {
  try {
    const response = await axiosInstance.get(`/schedule/trainer/classes/${classId}/participants`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching class participants:', error);
    throw error;
  }
};
