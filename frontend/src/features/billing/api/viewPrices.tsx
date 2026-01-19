import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_BILLING_API_URL || 'http://localhost:8080/api/v1/billing/';

export interface Price {
  id: string;
  metric: string;
  price: number;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const viewPricesApi = {
  getPrices: async (): Promise<Price[]> => {
    try {
      const response = await client.get<Price[]>('/prices');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      throw error;
    }
  },
};
