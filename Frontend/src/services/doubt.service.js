import api from './api.js';

export const askDoubt = async ({ documentId, question, language }) => {
    const response = await api.post('/doubt/ask', { documentId, question, language });
    return response.data;
};

export const getConversationHistory = async (documentId) => {
    const response = await api.get(`/doubt/conversation/${documentId}`);
    return response.data;
};

export const getDocumentConversations = async (documentId, page = 1, limit = 10) => {
    const response = await api.get(`/doubt/conversations/${documentId}`, {
        params: { page, limit }
    });
    return response.data;
};

export const getSuggestedQuestions = async (documentId) => {
    const response = await api.get(`/doubt/suggestions/${documentId}`);
    return response.data;
};

export const deleteConversation = async (conversationId) => {
    const response = await api.delete(`/doubt/conversation/${conversationId}`);
    return response.data;
};