// src/pages/WelcomePage.jsx
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../AuthContext";

const SUBJECTS = [
  { id: "analyse", label: "ANALYSE" },
  { id: "algebre", label: "ALGÈBRE" },
  { id: "sfsd", label: "SFSD" },
  { id: "electronic", label: "ELECTRONIC" },
  { id: "archi", label: "ARCHI" },
  { id: "proba", label: "PROBA" },
];

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "Student");

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  const goToSubject = (id) => {
    navigate(`/subject/${id}`);
  };

  const goToAuth = () => {
    navigate("/auth");
  };

  return (
    <main className="welcome-page">
      {/* شريط علوي */}
      <header className="welcome-header">
        <div className="welcome-greeting">
          <p className="welcome-semester">Semester 3</p>
          <h1 className="welcome-title">
            Welcome, <span>{displayName}</span>
          </h1>
          <p className="welcome-subtitle">
            Organize all your lecture photos by subject.
          </p>
        </div>

        <button className="logout-chip" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Grid المواد */}
      <section className="subjects-section">
        <div className="subjects-grid">
          {SUBJECTS.map((s, index) => (
            <button
              key={s.id}
              type="button"
              className={
                "subject-card" +
                (index === 1 || index === 4
                  ? " subject-card--light"
                  : index === 5
                  ? " subject-card--accent"
                  : "")
              }
              onClick={() => goToSubject(s.id)}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* أزرار Auth في الأسفل */}
      <section className="welcome-auth-actions">
        <button
          type="button"
          className="auth-pill auth-pill--dark"
          onClick={goToAuth}
        >
          SIGN IN
        </button>
        <button
          type="button"
          className="auth-pill auth-pill--light"
          onClick={goToAuth}
        >
          SIGN UP
        </button>
      </section>
    </main>
  );
};
