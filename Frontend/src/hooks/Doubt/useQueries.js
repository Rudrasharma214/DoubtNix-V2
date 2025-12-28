import { useQuery } from '@tanstack/react-query';
import {
    getConversationHistory,
    getDocumentConversations,
    getSuggestedQuestions,
} from '../../services/doubt.service';

export const useConversationHistoryQuery = (documentId) => {
    return useQuery({
        queryKey: ['conversationHistory', documentId],
        queryFn: async () => {
            return await getConversationHistory(documentId);
        }
    });
};

export const useDocumentConversationsQuery = (documentId, page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['documentConversations', documentId, page, limit],
        queryFn: async () => {
            return await getDocumentConversations(documentId, page, limit);
        },
        keepPreviousData: true,
    });
};

export const useSuggestedQuestionsQuery = (documentId) => {
    return useQuery({
        queryKey: ['suggestedQuestions', documentId],
        queryFn: async () => {
            return await getSuggestedQuestions(documentId);
        },
    });
};