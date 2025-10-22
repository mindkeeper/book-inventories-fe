import SignIn from "@/app/auth/sign-in";
import SignUp from "@/app/auth/sign-up";
import Home from "@/app/home";
import BookDetail from "@/app/books/detail";
import { BrowserRouter, Route, Routes } from "react-router";
import ProtectedLayout from "./protected-layout";
import AuthLayout from "./auth-layout";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books/:id" element={<BookDetail />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
