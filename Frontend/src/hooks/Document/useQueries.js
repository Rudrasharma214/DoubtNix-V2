import { useQuery } from "@tanstack/react-query";
import { getUserDocuments } from "../../services/document.service";

export const useGetDocuments = (params = {}) => {
    return useQuery({
        queryKey: ['documents', params],
        queryFn: async () => {
            return await getUserDocuments(params);
        },
        retry: 1, // Retry only once (2 attempts total)
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });
};