import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getDeals, updateDeal } from "../services/api";
import { useAuth } from "../context/useAuth";
import "./Deals.css";

function Deals() {
  const { user, loading: authLoading } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const loadDeals = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");
        setDeals(await getDeals(token));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, [authLoading, user]);

  const handleUpdate = async (dealId, status) => {
    try {
      setError("");

      const token = localStorage.getItem("access_token");
      const updatedDeal = await updateDeal(token, dealId, status);

      setDeals((currentDeals) =>
        currentDeals.map((deal) =>
          deal.id === dealId ? updatedDeal : deal
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="deals-page">
          <p>Loading deals...</p>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="deals-page">
          <h1>Deals</h1>
          <p>Please login to view your deals.</p>
          <Link to="/login">Go to Login</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="deals-page">
        <div className="deals-container">
          <div className="deals-header">
            <div>
              <p className="deals-eyebrow">TRANSACTION HISTORY</p>
              <h1>Your Deals</h1>
              <p>
                Track active, completed, and cancelled property deals.
              </p>
            </div>

            <Link
              to={
                user.role === "OWNER"
                  ? "/owner-dashboard"
                  : "/my-interests"
              }
            >
              Back to dashboard
            </Link>
          </div>

          {error && <div className="deals-error">{error}</div>}

          {!error && deals.length === 0 && (
            <div className="deals-empty">No deals yet.</div>
          )}

          <div className="deals-list">
            {deals.map((deal) => (
              <article className="deal-card" key={deal.id}>
                <div>
                  <h2>Property #{deal.property}</h2>

                  <p>
                    Agreed price: ₹
                    {Number(deal.agreed_price).toLocaleString("en-IN")}
                  </p>

                  <p>
                    Created:{" "}
                    {new Date(deal.created_at).toLocaleDateString()}
                  </p>

                  {deal.completed_at && (
                    <p>
                      Completed:{" "}
                      {new Date(deal.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="deal-actions">
                  <span
                    className={`deal-status ${deal.status.toLowerCase()}`}
                  >
                    {deal.status}
                  </span>

                  {user.role === "OWNER" &&
                    deal.status === "ACTIVE" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate(deal.id, "COMPLETED")
                          }
                        >
                          Complete
                        </button>

                        <button
                          type="button"
                          className="secondary"
                          onClick={() =>
                            handleUpdate(deal.id, "CANCELLED")
                          }
                        >
                          Cancel
                        </button>
                      </>
                    )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export default Deals;