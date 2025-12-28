import { useQuery } from '@tanstack/react-query';
import { getUser } from '../../services/auth.service.js';

export const useGetUser = (options = {}) => {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            return await getUser();
        },
        retry: 1, // Retry only once (2 attempts total)
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        ...options, // Allow options like enabled to override
    });
};
