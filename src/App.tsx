import { Navigate, Route, Routes } from "react-router-dom";
import { ChatPage } from "./pages/ChatPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { useAuth } from "./hooks/useAuth";
import { UserRole } from "./types/api";
import { AdminPage } from "./pages/AdminPage";

function PrivateRoute({
  children,
  roles,
}: {
  children: JSX.Element;
  roles?: UserRole[];
}) {
  const { token, user } = useAuth();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const redirectPath = user.role === "ADMIN" ? "/admin" : "/chat";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { token, user } = useAuth();
  if (token && user) {
    const redirectPath = user.role === "ADMIN" ? "/admin" : "/chat";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

function RootRedirect() {
  const { token, user } = useAuth();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  const redirectPath = user.role === "ADMIN" ? "/admin" : "/chat";
  return <Navigate to={redirectPath} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute roles={["STUDENT", "LECTURER"]}>
            <ChatPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute roles={["ADMIN"]}>
            <AdminPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
