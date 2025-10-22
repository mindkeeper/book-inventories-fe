import { Navigate, Outlet } from "react-router";

export default function AuthLayout() {
  const token = localStorage.getItem("access_token");

  return token ? <Navigate to="/sign-in" replace /> : <Outlet />;
}
