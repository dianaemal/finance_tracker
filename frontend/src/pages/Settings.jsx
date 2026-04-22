import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: ""
  });

  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");

  // 🔹 Load user
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await api.get("/user/me");
      setUser(res.data);
      setForm({
        username: res.data.username || "",
        email: res.data.email || ""
      });
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!form.username) errors.username = "Username is required.";
    if (!form.email) errors.email = "Email is required.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingProfile(true);
    setErrorMessage("");
    setMessage("");

    try {
      const res = await api.put("/user/", form);
      if (res.status === 200) {
        setMessage("Profile updated successfully.");
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // 🔹 Password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!passwordForm.current_password)
      errors.current_password = "Current password required.";
    if (!passwordForm.new_password)
      errors.new_password = "New password required.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingPassword(true);
    setErrorMessage("");
    setMessage("");

    try {
      const res = await api.put("/user/password", passwordForm);
      if (res.status === 200) {
        setMessage("Password updated successfully.");
        setPasswordForm({ current_password: "", new_password: "" });
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to update password. Make sure you type the correct current password.");
    } finally {
      setSavingPassword(false);
      setPasswordForm({
        current_password: "",
        new_password: ""
      })

    }
  };

  // 🔹 Delete account
  const handleDelete = async () => {
    const ok = window.confirm("Delete your account?");
    if (!ok) return;

    setErrorMessage("");

    try {
      await api.delete("/user/delete");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to delete account.");
    }
  };

  // 🔹 Loading state
  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main-area">
          <div className="page-loading">
            <span className="loading-spinner" />
            Loading settings...
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="main-area">
        <p className="error-message">User not found</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-area">
        <header className="page-header">
          <h1 className="page-title">Settings</h1>
        </header>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {message && <div className="success-message">{message}</div>}

        {/* Profile */}
        <section className="card">
          <h2>Profile</h2>

          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  if (fieldErrors.username)
                    setFieldErrors((prev) => ({ ...prev, username: "" }));
                }}
              />
              {fieldErrors.username && (
                <p className="field-error">{fieldErrors.username}</p>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (fieldErrors.email)
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
              />
              {fieldErrors.email && (
                <p className="field-error">{fieldErrors.email}</p>
              )}
            </div>

            <button className="btn" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="card" style={{ marginTop: "1.5rem" }}>
          <h2>Change password</h2>

          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label>Current password</label>
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => {
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value
                  });
                  if (fieldErrors.current_password)
                    setFieldErrors((prev) => ({
                      ...prev,
                      current_password: ""
                    }));
                }}
              />
              {fieldErrors.current_password && (
                <p className="field-error">
                  {fieldErrors.current_password}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>New password</label>
              <input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => {
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value
                  });
                  if (fieldErrors.new_password)
                    setFieldErrors((prev) => ({
                      ...prev,
                      new_password: ""
                    }));
                }}
              />
              {fieldErrors.new_password && (
                <p className="field-error">
                  {fieldErrors.new_password}
                </p>
              )}
            </div>

            <button className="btn" disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="card" style={{ marginTop: "1.5rem" }}>
          <h2>Delete account</h2>
          <p className="empty-hint">
            This action cannot be undone.
          </p>

          <button className="btn-danger" onClick={handleDelete}>
            Delete account
          </button>
        </section>
      </main>
    </div>
  );
}