import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentEmail: string | null = null;

export function setAxiosEmail(email: string | null) {
  currentEmail = email;
}

axiosInstance.interceptors.request.use(
  (config) => {
    if (currentEmail) {
      config.headers['X-User-Email'] = currentEmail;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
