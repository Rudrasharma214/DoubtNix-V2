import { useQuery } from "@tanstack/react-query";
import { getUserDocuments } from "../../services/document.service";

export const useGetDocuments = (params = {}) => {
    return useQuery({
        queryKey: ['documents', params],
        queryFn: async () => {
            return await getUserDocuments(params);
        },
        retry: false, // Retry only once (2 attempts total)
    });
};