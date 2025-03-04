import axios from 'axios';

const API_URL = '/api/auth';

export const signup = (username: string, password: string) => {
  return axios.post(`${API_URL}/signup`, { username, password });
};

export const login = (username: string, password: string) => {
  return axios.post(`${API_URL}/login`, { username, password });
};
