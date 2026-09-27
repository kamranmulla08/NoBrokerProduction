import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyProperties,
  getOwnerInterests,
} from "../services/api";
import "./OwnerDashboard.css";

function OwnerDashboard() {
  const { user, loading: authLoading } = useAuth();

  const [properties, setProperties] = useState([]);
  const [interests, setInterests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const [propertyData, interestData] =
          await Promise.all([
            getMyProperties(token),
            getOwnerInterests(token),
          ]);

        setProperties(
          Array.isArray(propertyData)
            ? propertyData
            : propertyData.results || []
        );

        setInterests(
          Array.isArray(interestData)
            ? interestData
            : interestData.results || []
        );
      } catch (err) {
        console.error(
          "Owner dashboard error:",
          err
        );

        setError(
          err.message ||
            "Failed to load owner dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="owner-dashboard">
        <div className="owner-dashboard-loading">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="owner-dashboard">
        <div className="owner-dashboard-message">
          <h2>Please login first</h2>

          <Link
            to="/login"
            className="owner-dashboard-button"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "OWNER") {
    return (
      <div className="owner-dashboard">
        <div className="owner-dashboard-message">
          <h2>Owner access required</h2>
          <p>
            This dashboard is available only for
            property owners.
          </p>

          <Link
            to="/properties"
            className="owner-dashboard-button"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <div className="owner-dashboard-container">

        {/* Header */}
        <div className="owner-dashboard-header">
          <div>
            <p className="owner-dashboard-label">
              OWNER DASHBOARD
            </p>

            <h1>
              Welcome, {user.name || "Owner"}
            </h1>

            <p className="owner-dashboard-subtitle">
              Manage your properties and incoming
              buyer interests.
            </p>
          </div>

          <Link
            to="/post-property"
            className="owner-dashboard-primary-button"
          >
            + Post Property
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="owner-dashboard-error">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="owner-dashboard-stats">

          <div className="owner-stat-card">
            <span className="owner-stat-title">
              My Properties
            </span>

            <strong>
              {properties.length}
            </strong>

            <span className="owner-stat-description">
              Properties listed by you
            </span>
          </div>

          <div className="owner-stat-card">
            <span className="owner-stat-title">
              Incoming Interests
            </span>

            <strong>
              {interests.length}
            </strong>

            <span className="owner-stat-description">
              Buyers interested
            </span>
          </div>

          <div className="owner-stat-card">
            <span className="owner-stat-title">
              Conversations
            </span>

            <strong>—</strong>

            <span className="owner-stat-description">
              View buyer conversations
            </span>
          </div>

        </div>

        {/* Main Content */}
        <div className="owner-dashboard-grid">

          {/* Properties */}
          <section className="owner-dashboard-section">

            <div className="owner-section-header">
              <div>
                <h2>My Properties</h2>
                <p>
                  Your current property listings
                </p>
              </div>

              <Link
                to="/properties"
                className="owner-section-link"
              >
                Browse
              </Link>
            </div>

            {properties.length === 0 ? (
              <div className="owner-empty-state">
                <h3>No properties yet</h3>

                <p>
                  Start by posting your first
                  property.
                </p>

                <Link
                  to="/post-property"
                  className="owner-dashboard-button"
                >
                  + Post Property
                </Link>
              </div>
            ) : (
              <div className="owner-property-list">

                {properties.map((property) => (
                  <div
                    className="owner-property-card"
                    key={property.id}
                  >

                    <div className="owner-property-image">
                      {property.images &&
                      property.images.length > 0 ? (
                        <img
                          src={
                            property.images[0].image ||
                            property.images[0].image_url
                          }
                          alt={property.title}
                        />
                      ) : (
                        <div className="owner-no-image">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="owner-property-info">

                      <h3>
                        {property.title}
                      </h3>

                      <p className="owner-property-location">
                        {property.city ||
                          "Location not available"}
                      </p>

                      <p className="owner-property-price">
                        ₹
                        {Number(
                          property.price || 0
                        ).toLocaleString("en-IN")}
                      </p>

                      <div className="owner-property-meta">
                        {property.bedrooms !==
                          undefined && (
                          <span>
                            {property.bedrooms} Beds
                          </span>
                        )}

                        {property.bathrooms !==
                          undefined && (
                          <span>
                            {property.bathrooms} Baths
                          </span>
                        )}

                        {property.area !==
                          undefined && (
                          <span>
                            {property.area} sq.ft
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/properties/${property.id}`}
                        className="owner-view-property"
                      >
                        View Property →
                      </Link>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </section>

          {/* Interests */}
          <section className="owner-dashboard-section">

            <div className="owner-section-header">
              <div>
                <h2>Incoming Interests</h2>
                <p>
                  Buyers interested in your
                  properties
                </p>
              </div>
            </div>

            {interests.length === 0 ? (
              <div className="owner-empty-state">
                <h3>No interests yet</h3>

                <p>
                  Buyer interest requests will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="owner-interest-list">

                {interests.slice(0, 5).map(
                  (interest) => (
                    <div
                      className="owner-interest-card"
                      key={interest.id}
                    >

                      <div className="owner-interest-content">

                        <h3>
                          {interest.property_title ||
                            interest.property?.title ||
                            `Property #${
                              interest.property
                            }`}
                        </h3>

                        <p>
                          Buyer{" "}
                          {interest.buyer_name ||
                            interest.buyer?.name ||
                            `#${interest.buyer}`}
                        </p>

                        {interest.message && (
                          <p className="owner-interest-message">
                            "{interest.message}"
                          </p>
                        )}

                      </div>

                      <span
                        className={`owner-interest-status ${
                          String(
                            interest.status || ""
                          ).toLowerCase()
                        }`}
                      >
                        {interest.status ||
                          "Pending"}
                      </span>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

        </div>

        {/* Quick Actions */}
        <section className="owner-dashboard-section owner-quick-actions">

          <div className="owner-section-header">
            <div>
              <h2>Quick Actions</h2>
              <p>
                Manage your NoBroker account
              </p>
            </div>
          </div>

          <div className="owner-action-grid">

            <Link
              to="/post-property"
              className="owner-action-card"
            >
              <strong>
                + Post Property
              </strong>

              <span>
                Add a new property listing
              </span>
            </Link>

            <Link
              to="/conversations"
              className="owner-action-card"
            >
              <strong>
                💬 Conversations
              </strong>

              <span>
                Chat with interested buyers
              </span>
            </Link>

            <Link
              to="/properties"
              className="owner-action-card"
            >
              <strong>
                🏠 Browse Properties
              </strong>

              <span>
                View all property listings
              </span>
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}

export default OwnerDashboard;