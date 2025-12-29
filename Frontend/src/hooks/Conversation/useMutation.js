import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    updateConversationTitle, 
    deleteConversation 
} from "../../services/conversation.service.js";

export const useUpdateConversationTitle = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ conversationId, title }) => {
            return await updateConversationTitle(conversationId, title);
        },
        ...options,
        onMutate: async ({ conversationId, title }) => {
            await queryClient.cancelQueries({ queryKey: ['conversations'] });
            const previous = queryClient.getQueriesData({ queryKey: ['conversations'] });

            // Optimistically update title in cache
            previous.forEach(([key, data]) => {
                if (!data) return;
                const convs = data.data?.conversations || [];
                const newConvs = convs.map(c => c._id === conversationId ? { ...c, title } : c);
                queryClient.setQueryData(key, {
                    ...data,
                    data: {
                        ...data.data,
                        conversations: newConvs
                    }
                });
            });

            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                context.previous.forEach(([key, val]) => {
                    queryClient.setQueryData(key, val);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });
};

export const useDeleteConversation = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (conversationId) => {
            return await deleteConversation(conversationId);
        },
        ...options,
        onMutate: async (conversationId) => {
            await queryClient.cancelQueries({ queryKey: ['conversations'] });

            // Snapshot previous queries matching 'conversations'
            const previous = queryClient.getQueriesData({ queryKey: ['conversations'] });

            // Optimistically remove conversation from all matching queries
            previous.forEach(([key, data]) => {
                if (!data) return;
                const convs = data.data?.conversations || [];
                const newConvs = convs.filter(c => c._id !== conversationId);
                queryClient.setQueryData(key, {
                    ...data,
                    data: {
                        ...data.data,
                        conversations: newConvs,
                        pagination: {
                            ...data.data.pagination,
                            total: Math.max((data.data.pagination?.total || convs.length) - (convs.length - newConvs.length), 0)
                        }
                    }
                });
            });

            return { previous };
        },
        onError: (err, variables, context) => {
            // rollback
            if (context?.previous) {
                context.previous.forEach(([key, val]) => {
                    queryClient.setQueryData(key, val);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });
};