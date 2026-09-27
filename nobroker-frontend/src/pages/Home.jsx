import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProperties } from "../services/api";
import PropertyCard from "../components/PropertyCard";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedProperties() {
      try {
        const data = await getProperties();
        if (!cancelled) {
          setProperties(Array.isArray(data) ? data.slice(0, 6) : []);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load featured properties.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFeaturedProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (city.trim()) {
      params.set("city", city.trim());
    }

    if (listingType) {
      params.set("listing_type", listingType);
    }

    if (propertyType) params.set("property_type", propertyType);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);

    const query = params.toString();
    navigate(`/properties${query ? `?${query}` : ""}`);
  };

  return (
    <>
      <Navbar />

      <main className="home">
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-kicker">A better way home</p>
            <h1>Find Your Perfect Home with NoBroker</h1>
            <p>Search verified homes directly from owners, without brokerage.</p>

            <form className="search-box" onSubmit={handleSearch}>
              <div className="search-field search-location">
                <label htmlFor="home-city">Location</label>
                <input id="home-city" type="search" placeholder="City or neighbourhood" value={city} onChange={(event) => setCity(event.target.value)} />
              </div>
              <div className="search-field">
                <label htmlFor="home-listing-type">Looking for</label>
                <select id="home-listing-type" value={listingType} onChange={(event) => setListingType(event.target.value)}>
                  <option value="">Buy or rent</option><option value="SALE">Buy</option><option value="RENT">Rent</option>
                </select>
              </div>
              <div className="search-field">
                <label htmlFor="home-property-type">Property type</label>
                <select id="home-property-type" value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
                  <option value="">Any type</option><option value="FLAT">Flat</option><option value="HOUSE">House</option><option value="PG">PG</option>
                </select>
              </div>
              <div className="search-field compact-field">
                <label htmlFor="home-bedrooms">Bedrooms</label>
                <select id="home-bedrooms" value={bedrooms} onChange={(event) => setBedrooms(event.target.value)}>
                  <option value="">Any</option><option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3 BHK</option><option value="4">4 BHK</option><option value="5+">5+ BHK</option>
                </select>
              </div>
              <div className="search-field price-field">
                <label htmlFor="home-min-price">Price range</label>
                <div className="price-inputs">
                  <input id="home-min-price" type="number" min="0" placeholder="Min" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} />
                  <span>to</span>
                  <input aria-label="Maximum price" type="number" min="0" placeholder="Max" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} />
                </div>
              </div>
              <button type="submit">Search homes</button>
            </form>
          </div>
        </section>

        <section className="benefits" aria-label="NoBroker benefits">
          <div className="benefit-item"><span className="benefit-icon">01</span><div><strong>No Brokerage</strong><span>Keep more of your money</span></div></div>
          <div className="benefit-item"><span className="benefit-icon">02</span><div><strong>Verified Listings</strong><span>Homes worth your time</span></div></div>
          <div className="benefit-item"><span className="benefit-icon">03</span><div><strong>Dedicated Support</strong><span>Help when you need it</span></div></div>
          <div className="benefit-item"><span className="benefit-icon">04</span><div><strong>Quick &amp; Easy</strong><span>Find home, faster</span></div></div>
        </section>

        <section className="property-types">
          <div className="section-heading">
            <div><p className="section-kicker">Handpicked for you</p><h2>Featured properties</h2></div>
            <Link to="/properties" className="view-all-link">View all properties <span>↗</span></Link>
          </div>

          {loading && <p className="status-message">Loading properties...</p>}
          {!loading && error && <p className="status-message error-message">{error}</p>}
          {!loading && !error && properties.length === 0 && (
            <p className="status-message">No properties are available yet.</p>
          )}

          {!loading && !error && properties.length > 0 && (
            <div className="property-type-grid">
              {properties.slice(0, 4).map((property) => (
                <PropertyCard property={property} key={property.id} />
              ))}
            </div>
          )}
        </section>

        <footer className="home-footer">
          <div className="footer-inner">
            <div className="footer-brand"><Link to="/" className="footer-logo">NoBroker<span>.</span></Link><p>Find your next chapter,<br />without the brokerage.</p></div>
            <div className="footer-links">
              <div><strong>Explore</strong><Link to="/properties">Properties</Link><Link to="/register">List your property</Link></div>
              <div><strong>Company</strong><Link to="/">About NoBroker</Link><Link to="/conversations">Support</Link></div>
              <div><strong>Connect</strong><span>hello@nobroker.local</span><span>Available every day</span></div>
            </div>
          </div>
          <div className="footer-bottom"><span>© 2026 NoBroker. Built for better moves.</span><span>Direct homes. Clear decisions.</span></div>
        </footer>
      </main>
    </>
  );
}

export default Home;