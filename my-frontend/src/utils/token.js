import axios from '../axiosConfig';

const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post('api/token/refresh/', {
      refresh: refresh,
    });
    const { access } = response.data;
    localStorage.setItem('access_token', access);
    return access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

export default refreshToken;
