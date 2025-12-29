import { useQuery } from '@tanstack/react-query';
import {
    getConversations,
    getConversationStats 
} from '../../services/conversation.service.js';

export const useGetConversations = (page, limit, search = '') => {
    return useQuery({
        queryKey: ['conversations', page, limit, search],
        queryFn: async () => {
            return await getConversations(page, limit, search);
        },
        retry: 1, // Retry only once (2 attempts total)
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
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