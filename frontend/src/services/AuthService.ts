import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8083') + '/api/auth';

export const signup = (email: string, nickname: string, password: string) => {
  return axios.post(`${API_URL}/signup`, { email, nickname, password });
};

export const login = (email: string, password: string) => {
  return axios.post(`${API_URL}/login`, { email, password });
};

