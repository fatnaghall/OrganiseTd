// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { AuthPage } from "./pages/AuthPage";
import { WelcomePage } from "./pages/WelcomePage";
import { SubjectGallery } from "./pages/SubjectGallery";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <WelcomePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/subject/:id"
        element={
          <PrivateRoute>
            <SubjectGallery />
          </PrivateRoute>
        }
      />

      {/* أي مسار آخر يرجع للصفحة الرئيسية */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
