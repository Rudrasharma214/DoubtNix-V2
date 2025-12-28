import { useQuery } from '@tanstack/react-query';
import {
    getConversations,
    getConversationById,
    getConversationStats 
} from '../../services/conversation.service.js';

export const useGetConversations = (page, limit) => {
    return useQuery({
        queryKey: ['conversations', page, limit],
        queryFn: async () => {
            return await getConversations({ page, limit });
        },
        retry: 1, // Retry only once (2 attempts total)
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });
};

export const useGetDocumentById = (documentId, options = {}) => {
    return useQuery({
        queryKey: ['document', documentId],
        queryFn: async () => {
            return await getConversationById(documentId);
        },
        retry: 1, // Retry only once (2 attempts total)
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        ...options, // Allow options like enabled to override
    });
};

export const useGetConversationsStats = () => {
    return useQuery({
        queryKey: ['conversation-stats'],
        queryFn: async () => {
            return await getConversationStats();
        },
        retry: 1, // Retry only once (2 attempts total)
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });
};