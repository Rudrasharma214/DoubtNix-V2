import api from './api.js';

export const getConversations = async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/conversations', {
        params: { page, limit, search }
    });
    return response.data;
};

export const updateConversationTitle = async (conversationId, title) => {
    const response = await api.patch(`/conversations/${conversationId}`, { title });
    return response.data;
};

export const deleteConversation = async (conversationId) => {
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
};

export const getConversationStats = async () => {
    const response = await api.get('/conversations/stats');
    return response.data;
};