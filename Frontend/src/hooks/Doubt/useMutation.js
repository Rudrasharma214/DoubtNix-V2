import { useMutation } from "@tanstack/react-query";
import { 
    askDoubt,
    deleteConversation, 
} from "../../services/doubt.service";

export const useAskDoubtMutation = () => {
    return useMutation({
        mutationFn: async ({ documentId, question, language }) => {
            return await askDoubt({ documentId, question, language });
        },
    });
};

export const useDeleteConversationMutation = () => {
    return useMutation({
        mutationFn: async (conversationId) => {
            return await deleteConversation(conversationId);
        },
    });
};