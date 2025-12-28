import { useQueries } from "@tanstack/react-query";
import { getUserDocuments } from "../../services/document.service";

export const useGetDocuments = (queries) => {
    return useQueries({
        queries: ['documents'],
        queryFn: async () => {
            return await getUserDocuments(queries);
        }
    });
};