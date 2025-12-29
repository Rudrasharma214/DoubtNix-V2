import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadDocument, deleteDocument } from "../../services/document.service";

export const useUploadDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            return await uploadDocument(formData);
        },
        onSuccess: () => {
            // invalidate documents list so UI refreshes
            queryClient.invalidateQueries(['documents']);
        }
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (documentId) => {
            return await deleteDocument(documentId);
        },
        onMutate: async (documentId) => {
            await queryClient.cancelQueries({ queryKey: ['documents'] });

            // Snapshot previous queries matching 'documents'
            const previous = queryClient.getQueriesData({ queryKey: ['documents'] });

            // Optimistically remove document from all matching queries
            previous.forEach(([key, data]) => {
                if (!data) return;
                const docs = data.data?.documents || [];
                const newDocs = docs.filter(d => d._id !== documentId);
                queryClient.setQueryData(key, {
                    ...data,
                    data: {
                        ...data.data,
                        documents: newDocs,
                        pagination: {
                            ...data.data.pagination,
                            total: Math.max((data.data.pagination?.total || docs.length) - (docs.length - newDocs.length), 0)
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
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        }
    });
};