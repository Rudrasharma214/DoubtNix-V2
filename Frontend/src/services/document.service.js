import api from './api.js';

export const uploadDocument = async (formData) => {
  const response = await api.post('/documents', formData, {
    headers: {  
        'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUserDocuments = async (queries) => {
  const response = await api.get('/documents', { params: queries });
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};