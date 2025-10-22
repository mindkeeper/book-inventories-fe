import { api } from "@/utils/api";
import { useMutation } from "@tanstack/react-query";
import type { TResponse } from "@/types/common";
import { useNavigate } from "react-router";

type AuthRequest = {
  email: string;
  password: string;
};

type AuthTokens = {
  access_token: string;
};
export const useSignUp = () => {
  const navigate = useNavigate();
  return useMutation<TResponse<AuthTokens>, Error, AuthRequest>({
    mutationFn: (data: AuthRequest) =>
      api.post<AuthTokens>("/auth/sign-up", data),
    onSuccess: (data) => {
      const token = data.data.access_token;
      localStorage.setItem("access_token", token);
      setTimeout(() => {
        navigate("/");
      }, 500);
    },
  });
};

export const useSignIn = () => {
  const navigate = useNavigate();

  return useMutation<TResponse<AuthTokens>, Error, AuthRequest>({
    mutationFn: (data: AuthRequest) =>
      api.post<AuthTokens>("/auth/sign-in", data),
    onSuccess: async (data) => {
      const token = data.data.access_token;
      localStorage.setItem("access_token", token);
      setTimeout(() => {
        navigate("/");
      }, 500);
    },
  });
};
