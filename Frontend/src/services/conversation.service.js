import api from './api.js';

export const getConversations = async (page = 1, limit = 10) => {
    const response = await api.get('/conversation', {
        params: { page, limit }
    });
    return response.data;
};

export const getConversationById = async (conversationId) => {
    const response = await api.get(`/conversation/${conversationId}`);
    return response.data;
};

export const updateConversationTitle = async (conversationId, title) => {
    const response = await api.patch(`/conversation/${conversationId}`, { title });
    return response.data;
};

export const deleteConversation = async (conversationId) => {
    const response = await api.delete(`/conversation/${conversationId}`);
    return response.data;
};

export const getConversationStats = async () => {
    const response = await api.get('/conversation/stats');
    return response.data;
};