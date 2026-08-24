import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth/LoginPage.jsx";
import { RegisterPage } from "./features/auth/RegisterPage.jsx";
import { CallManager } from "./features/call/CallManager.jsx";
import { ChatPage } from "./features/chat/ChatPage.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { useAuthStore } from "./store/authStore.js";

export default function App() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <>
      {user && <CallManager />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
