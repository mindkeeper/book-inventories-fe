import { Navigate, Outlet } from "react-router";
import { LogoutButton } from "./LogoutButton";

export default function ProtectedLayout() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with logout button */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">Book Inventory</h1>
          </div>
          <LogoutButton />
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
