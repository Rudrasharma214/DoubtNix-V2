import { useMutation } from "@tanstack/react-query";
import { 
    updateConversationTitle, 
    deleteConversation 
} from "../../services/conversation.service.js";

export const useUpdateConversationTitle = (options = {}) => {
    return useMutation({
        mutationFn: async ({ conversationId, title }) => {
            return await updateConversationTitle(conversationId, title);
        },
        ...options,
    });
};

export const useDeleteConversation = (options = {}) => {
    return useMutation({
        mutationFn: async (conversationId) => {
            return await deleteConversation(conversationId);
        },
        ...options,
    });
};