import api from './api.js';

export const askDoubt = async ({ documentId, question, language }) => {
    const response = await api.post('/doubt/ask', { documentId, question, language });
    return response.data;
};

export const getConversationHistory = async (documentId) => {
    const response = await api.get(`/doubt/${documentId}`);
    return response.data;
};


export const deleteConversationMessages = async (conversationId) => {
    const response = await api.delete(`/doubt/${conversationId}`);
    return response.data;
};