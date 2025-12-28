import { useMutation } from "@tanstack/react-query"
import { uploadDocument, deleteDocument } from "../../services/document.service";


export const useUploadDocument = () => {
    return useMutation({
        mutationFn: async (formData) => {
            return await uploadDocument(formData);
        },
    });
};

export const useDeleteDocument = () => {
    return useMutation({
        mutationFn: async (documentId) => {
            return await deleteDocument(documentId);
        },
    });
};