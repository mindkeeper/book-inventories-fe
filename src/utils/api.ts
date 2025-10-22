import { ApiClient } from "@/lib/apiClient";

export const api = new ApiClient(import.meta.env.VITE_API_URL);
