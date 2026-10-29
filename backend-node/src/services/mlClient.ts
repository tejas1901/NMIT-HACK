import axios, { AxiosInstance } from 'axios';
import { config } from '../config.js';

export const mlClient: AxiosInstance = axios.create({
  baseURL: config.mlServiceUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function checkMlHealth(): Promise<boolean> {
  try {
    const res = await mlClient.get('/ml/health');
    return res.status === 200;
  } catch {
    return false;
  }
}
