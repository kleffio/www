import axios from 'axios';

//THIS SHOULD BE REPLACED BY THE API-GATEWAY WHEN DONE
const DEFAULT_BASE =  'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: DEFAULT_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function createServiceClient(baseUrl?: string) {
  return axios.create({
    baseURL: baseUrl || DEFAULT_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default axiosInstance;
