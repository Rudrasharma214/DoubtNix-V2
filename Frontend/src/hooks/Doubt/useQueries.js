import { useQuery } from '@tanstack/react-query';
import {
    getConversationHistory
} from '../../services/doubt.service';

export const useConversationHistoryQuery = (documentId) => {
    return useQuery({
        queryKey: ['conversationHistory', documentId],
        queryFn: async () => {
            return await getConversationHistory(documentId);
        },
        retry: 0, // Retry only once (1 attempts total)
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });
};