
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../services/api";
import { useAuth } from "../context/useAuth";
import "./Profile.css";

const API_ROOT_URL = API_BASE_URL.replace(/\/api$/, "");

function getProfileImageUrl(imagePath) {
  if (!imagePath) return "";

  return imagePath.startsWith("http")
    ? imagePath
    : `${API_ROOT_URL}${imagePath}`;
}

function getErrorMessage(data) {
  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }

      if (typeof value === "string" && value) {
        return value;
      }
    }
  }

  return "Unable to update your profile.";
}

function Profile() {
  const navigate = useNavigate();
  const {
    user,
    setUser,
    logout,
    loading: authLoading,
  } = useAuth();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please login again to update your profile.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);

      if (profilePhoto) {
        payload.append("profile_photo", profilePhoto);
      }

      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      if (!data.user) {
        throw new Error("The server did not return the updated profile.");
      }

      setUser(data.user);
      setFormData({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
      });

      setProfilePhoto(null);
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (requestError) {
      setError(
        requestError.message || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });

    setProfilePhoto(null);
    setError("");
    setEditing(false);
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="profile-page">
          <div className="profile-state">
            Loading your profile...
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="profile-page">
          <div className="profile-state">
            <h1>Login required</h1>
            <p>Please login to view your profile.</p>
            <Link to="/login" className="profile-primary-button">
              Go to Login
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <div className="profile-container">
          <header className="profile-header">
            <div>
              <p className="profile-eyebrow">ACCOUNT PROFILE</p>
              <h1>My Profile</h1>
              <p>
                Manage your account details and contact information.
              </p>
            </div>

            <button
              type="button"
              className="profile-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </header>

          <section className="profile-card">
            <div className="profile-summary">
              <div className="profile-avatar">
                {user.profile_photo ? (
                  <img
                    src={getProfileImageUrl(user.profile_photo)}
                    alt={`${user.name || "User"} profile`}
                  />
                ) : (
                  <span>
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h2>{user.name || "No name provided"}</h2>
                <p>{user.email}</p>
                <span className="profile-role">{user.role}</span>
              </div>
            </div>

            {error && (
              <div className="profile-alert profile-alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="profile-alert profile-alert-success">
                {success}
              </div>
            )}

            {editing ? (
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="profile-form-grid">
                  <label>
                    Name
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Profile photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setProfilePhoto(
                          event.target.files?.[0] || null
                        )
                      }
                    />
                  </label>
                </div>

                <div className="profile-form-actions">
                  <button
                    type="submit"
                    className="profile-primary-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>

                  <button
                    type="button"
                    className="profile-secondary-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl className="profile-details">
                  <div>
                    <dt>Full name</dt>
                    <dd>{user.name || "Not provided"}</dd>
                  </div>

                  <div>
                    <dt>Email address</dt>
                    <dd>{user.email}</dd>
                  </div>

                  <div>
                    <dt>Phone number</dt>
                    <dd>{user.phone || "Not provided"}</dd>
                  </div>

                  <div>
                    <dt>Account type</dt>
                    <dd>{user.role}</dd>
                  </div>
                </dl>

                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-primary-button"
                    onClick={() => {
                      setFormData({
                        name: user.name || "",
                        email: user.email || "",
                        phone: user.phone || "",
                      });
                      setSuccess("");
                      setError("");
                      setEditing(true);
                    }}
                  >
                    Edit profile
                  </button>
                </div>
              </>
            )}
          </section>

          <nav
            className="profile-links"
            aria-label="Profile navigation"
          >
            <Link
              to={
                user.role === "OWNER"
                  ? "/owner-dashboard"
                  : "/my-interests"
              }
            >
              {user.role === "OWNER"
                ? "Owner Dashboard"
                : "My Interests"}
            </Link>

            <Link to="/conversations">Conversations</Link>
            <Link to="/deals">Deals</Link>
            <Link to="/properties">Browse Properties</Link>
          </nav>
        </div>
      </main>
    </>
  );
}

export default Profile;