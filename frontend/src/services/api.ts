import axios from 'axios';
import {
  Bill,
  BillItem,
  BillParticipant,
  ItemAssignment,
  BillScanResult,
  CreateBillRequest,
  CreateBillItemRequest,
  CreateParticipantRequest,
  CreateAssignmentRequest,
  SplitCalculation
} from '../types/bill.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Network error' };
  }
);

export const billsAPI = {
  // Bills
  createBill: (data: CreateBillRequest) => api.post('/bills', data),
  getBill: (id: number) => api.get(`/bills/${id}`),
  updateBill: (id: number, data: Partial<Bill>) => api.put(`/bills/${id}`, data),
  deleteBill: (id: number) => api.delete(`/bills/${id}`),
  getAllBills: () => api.get('/bills'),

  // Items
  getBillItems: (billId: number) => api.get(`/bills/${billId}/items`),
  addBillItem: (billId: number, data: CreateBillItemRequest) => 
    api.post(`/bills/${billId}/items`, data),
  bulkAddItems: (billId: number, items: CreateBillItemRequest[]) =>
    api.post(`/bills/${billId}/items/bulk`, { items }),
  updateItem: (id: number, data: Partial<BillItem>) => api.put(`/items/${id}`, data),
  deleteItem: (id: number) => api.delete(`/items/${id}`),

  // Participants
  getBillParticipants: (billId: number) => api.get(`/bills/${billId}/participants`),
  addParticipant: (billId: number, data: CreateParticipantRequest) =>
    api.post(`/bills/${billId}/participants`, data),
  updateParticipant: (id: number, data: Partial<BillParticipant>) =>
    api.put(`/participants/${id}`, data),
  removeParticipant: (id: number) => api.delete(`/participants/${id}`),

  // Assignments
  createAssignment: (data: CreateAssignmentRequest) => api.post('/assignments', data),
  getBillAssignments: (billId: number) => api.get(`/assignments/bills/${billId}/assignments`),
  updateAssignment: (id: number, data: Partial<ItemAssignment>) =>
    api.put(`/assignments/${id}`, data),
  deleteAssignment: (id: number) => api.delete(`/assignments/${id}`),

  // Splits
  calculateSplits: (billId: number, includeTax = true, includeTip = true) =>
    api.post(`/assignments/bills/${billId}/calculate`, { include_tax: includeTax, include_tip: includeTip }),
  getBillSplits: (billId: number) => api.get(`/assignments/bills/${billId}/splits`),
};

export const ocrAPI = {
  scanReceipt: (file: File): Promise<{ success: boolean; data: BillScanResult }> => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    return api.post('/ocr/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  extractText: (file: File): Promise<{ success: boolean; data: { text: string } }> => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    return api.post('/ocr/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
