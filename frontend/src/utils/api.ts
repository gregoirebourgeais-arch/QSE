import axios from 'axios';
import { FicheQSE } from '../types';

import { getCurrentBackendUrl } from './backendConfig';

const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.baseURL = `${getCurrentBackendUrl()}/api`;
  return config;
});

export const userApi = {
  login: async (code: string) => {
    const response = await api.post('/users/login', { code });
    return response.data;
  },
  create: async (user: any) => {
    const response = await api.post('/users', user);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
};

export const ficheApi = {
  create: async (fiche: Partial<FicheQSE>) => {
    const response = await api.post('/fiches', fiche);
    return response.data;
  },
  getAll: async (params?: any) => {
    const response = await api.get('/fiches', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/fiches/${id}`);
    return response.data;
  },
  update: async (id: string, fiche: Partial<FicheQSE>) => {
    const response = await api.put(`/fiches/${id}`, fiche);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/fiches/${id}`);
    return response.data;
  },
  validate: async (id: string) => {
    const response = await api.post(`/fiches/${id}/validate`);
    return response.data;
  },
  sendEmail: async (id: string) => {
    const response = await api.post(`/fiches/${id}/send-email`);
    return response.data;
  },
  download: (id: string) => `${getCurrentBackendUrl()}/api/fiches/${id}/download`,
};

export const statsApi = {
  get: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
};

export const syncApi = {
  syncFiches: async (fiches: FicheQSE[]) => {
    const response = await api.post('/sync', fiches);
    return response.data;
  },
};

export default api;
