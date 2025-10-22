import { type TPaginatedResponse } from "@/types/common";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
type BookQueryParams = {
  genre?: string; // filter using genre.keyName
  page?: number;
  perPage?: number;
  q?: string;
};
const bookKeys = {
  all: ["books"] as const,
  lists: () => [...bookKeys.all, "lists"] as const,
  list: (filters: BookQueryParams) => [...bookKeys.lists(), filters] as const,
  details: () => [...bookKeys.all, "detail"] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};

type Book = {
  id: string;
  title: string;
  author: string;
  published: string;
  genre: {
    id: string;
    name: string;
  };
};

export const useBooks = (params: BookQueryParams) => {
  const qp = new URLSearchParams();
  if (params?.genre) qp.set("genre", params.genre);
  if (params?.page) qp.set("page", String(params.page));
  if (params?.perPage) qp.set("perPage", String(params.perPage));
  if (params?.q) qp.set("q", params.q);

  const queryString = qp.toString();

  return useQuery({
    queryFn: () =>
      api.get<TPaginatedResponse<Book[]>>(
        queryString ? `/books?${queryString}` : "/books"
      ),
    queryKey: bookKeys.list(params),
  });
};

export const useBook = (id: string) => {
  return useQuery({
    queryFn: () => api.get<Book>(`/books/${id}`),
    queryKey: bookKeys.detail(id),
  });
};
