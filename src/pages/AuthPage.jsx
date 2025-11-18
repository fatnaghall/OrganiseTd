// src/pages/AuthPage.jsx
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export const AuthPage = () => {
  // mode يحدد هل نحن في Sign Up أم Sign In
  const [mode, setMode] = useState("signup"); // "signup" | "signin"

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // إنشاء حساب جديد
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = result.user;

      // حفظ الاسم واللقب في displayName (اختياري لكن جميل)
      await updateProfile(user, {
        displayName: `${form.firstName} ${form.lastName}`,
      });

      // إرسال إيميل تفعيل (لن نمنع الدخول لو لم يفعّل)
      await sendEmailVerification(user);

      setMessage(
        "Account created. Verification email sent. You can sign in now."
      );

      // يمكن أيضاً توجيهه مباشرة للصفحة الرئيسية
      navigate("/");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // تسجيل الدخول بحساب موجود
  const handleSignin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Sem 3 Lectures</h1>
        <p className="subtitle">Store all your course photos in one place.</p>

        {/* التبديل بين Sign Up و Sign In */}
        <div className="auth-toggle">
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign Up
          </button>
          <button
            className={mode === "signin" ? "active" : ""}
            onClick={() => setMode("signin")}
            type="button"
          >
            Sign In
          </button>
        </div>

        {/* فورم Sign Up */}
        {mode === "signup" ? (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="row">
              <input
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <input
                name="lastName"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Create account</button>
          </form>
        ) : (
          // فورم Sign In
          <form onSubmit={handleSignin} className="auth-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Sign in</button>
          </form>
        )}

        {/* عرض رسائل الأخطاء أو الرسائل المعلوماتية */}
        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
};
