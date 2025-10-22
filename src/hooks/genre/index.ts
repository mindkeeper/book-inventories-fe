import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

const genreKeys = {
  all: ["genres"] as const,
  lists: () => [...genreKeys.all, "lists"] as const,
  list: () => [...genreKeys.lists()] as const,
  details: () => [...genreKeys.all, "detail"] as const,
  detail: (id: number) => [...genreKeys.details(), id] as const,
};
type Genre = {
  id: number;
  name: string;
  keyName: string;
};
export const useGenres = () => {
  return useQuery({
    queryKey: genreKeys.list(),
    queryFn: () => api.get<Genre[]>("/genres"),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
};
