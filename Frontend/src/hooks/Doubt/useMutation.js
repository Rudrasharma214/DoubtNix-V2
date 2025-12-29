import { useMutation } from "@tanstack/react-query";
import { 
    askDoubt,
    deleteConversationMessages, 
} from "../../services/doubt.service";

export const useAskDoubtMutation = () => {
    return useMutation({
        mutationFn: async ({ documentId, question, language }) => {
            return await askDoubt({ documentId, question, language });
        },
    });
};

export const useDeleteConversationMessagesMutation = () => {
    return useMutation({
        mutationFn: async (conversationId) => {
            return await deleteConversationMessages(conversationId);
        },
    });
};