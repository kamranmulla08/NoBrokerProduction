import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          NoBrokerClone
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          <Link to="/">Home</Link>

          <Link to="/properties">
            Properties
          </Link>

          {/* OWNER links */}
          {!loading &&
            isAuthenticated &&
            user?.role === "OWNER" && (
              <>
                <Link to="/post-property">
                  Post Property
                </Link>

                <Link to="/conversations">
                  Messages
                </Link>
              </>
            )}

          {/* BUYER links */}
          {!loading &&
            isAuthenticated &&
            user?.role === "BUYER" && (
              <Link to="/my-interests">
                My Interests
              </Link>
            )}
        </div>

        {/* Right side */}
        <div className="navbar-actions">
          {!loading && isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="navbar-profile"
              >
                {user?.name || "Profile"}
              </Link>

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            !loading && (
              <>
                <Link
                  to="/login"
                  className="navbar-login"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="navbar-register"
                >
                  Register
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;