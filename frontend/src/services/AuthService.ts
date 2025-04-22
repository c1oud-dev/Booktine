import axios from 'axios';
const BASE_URL = process.env.REACT_APP_API_URL!;

const API_URL = (process.env.REACT_APP_API_URL || `${BASE_URL}`) + '/api/auth';

export const signup = (email: string, nickname: string, password: string) => {
  return axios.post(`${API_URL}/signup`, { email, nickname, password });
};

export const login = (email: string, password: string) => {
  return axios.post(`${API_URL}/login`, { email, password });
};

