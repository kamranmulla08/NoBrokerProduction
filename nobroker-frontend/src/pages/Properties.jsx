import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProperties } from "../services/api";
import PropertyCard from "../components/PropertyCard";

function Properties() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);

  const [city, setCity] = useState(() => searchParams.get("city") || "");
  const [listingType, setListingType] = useState(
    () => searchParams.get("listing_type") || ""
  );
  const [propertyType, setPropertyType] = useState(
    () => searchParams.get("property_type") || ""
  );
  const [bedrooms, setBedrooms] = useState(
    () => searchParams.get("bedrooms") || ""
  );
  const [minPrice, setMinPrice] = useState(
    () => searchParams.get("min_price") || ""
  );
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get("max_price") || ""
  );

  const [sort, setSort] = useState("newest");

  const [activeFilters, setActiveFilters] = useState(() => ({
    ...(searchParams.get("city") && {
      city: searchParams.get("city"),
    }),
    ...(searchParams.get("listing_type") && {
      listing_type: searchParams.get("listing_type"),
    }),
    ...(searchParams.get("property_type") && {
      property_type: searchParams.get("property_type"),
    }),
    ...(searchParams.get("bedrooms") && {
      bedrooms: searchParams.get("bedrooms"),
    }),
    ...(searchParams.get("min_price") && {
      min_price: searchParams.get("min_price"),
    }),
    ...(searchParams.get("max_price") && {
      max_price: searchParams.get("max_price"),
    }),
  }));

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProperties = useCallback(
    async (filters = activeFilters, requestedPage = 1) => {
      try {
        setLoading(true);
        setError("");

        const data = await getProperties({
          ...filters,
          sort,
          page: requestedPage,
          page_size: 9,
        });

        setProperties(Array.isArray(data) ? data : data.results || []);
        setTotal(Array.isArray(data) ? data.length : data.count || 0);
        setTotalPages(Array.isArray(data) ? 1 : data.total_pages || 1);
        setPage(Array.isArray(data) ? 1 : data.page || requestedPage);
      } catch (err) {
        console.error("Property loading error:", err);
        setError(err.message || "Unable to load properties.");
      } finally {
        setLoading(false);
      }
    },
    [activeFilters, sort]
  );

  useEffect(() => {
    loadProperties(activeFilters, 1);
  }, [activeFilters, sort, loadProperties]);

  const handleSearch = () => {
    const filters = {};

    if (city.trim()) {
      filters.city = city.trim();
    }

    if (listingType) {
      filters.listing_type = listingType;
    }

    if (propertyType) {
      filters.property_type = propertyType;
    }

    if (bedrooms) {
      filters.bedrooms = bedrooms;
    }

    if (minPrice) {
      filters.min_price = minPrice;
    }

    if (maxPrice) {
      filters.max_price = maxPrice;
    }

    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setCity("");
    setListingType("");
    setPropertyType("");
    setBedrooms("");
    setMinPrice("");
    setMaxPrice("");
    setActiveFilters({});
  };

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "calc(100vh - 70px)",
          background: "#f7f7f7",
          paddingBottom: "60px",
        }}
      >
        {/* PAGE HEADER */}

        <section
          style={{
            background: "white",
            padding: "45px 20px 30px",
            textAlign: "center",
            borderBottom: "1px solid #eee",
          }}
        >
          <h1
            style={{
              fontSize: "40px",
              marginBottom: "10px",
            }}
          >
            Properties
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "17px",
            }}
          >
            Find your perfect property without brokerage
          </p>
        </section>

        {/* FILTER SECTION */}

        <section
          style={{
            maxWidth: "1200px",
            margin: "30px auto",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 3px 15px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                marginBottom: "20px",
              }}
            >
              Search Properties
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
              }}
            >
              {/* CITY */}

              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />

              {/* SORT */}

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={inputStyle}
              >
                <option value="newest">Newest first</option>
                <option value="price_low_to_high">
                  Price: low to high
                </option>
                <option value="price_high_to_low">
                  Price: high to low
                </option>
              </select>

              {/* LISTING TYPE */}

              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                style={inputStyle}
              >
                <option value="">Buy / Rent</option>
                <option value="SALE">Buy</option>
                <option value="RENT">Rent</option>
              </select>

              {/* PROPERTY TYPE */}

              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                style={inputStyle}
              >
                <option value="">Property Type</option>
                <option value="FLAT">Flat</option>
                <option value="HOUSE">House</option>
                <option value="PG">PG</option>
              </select>

              {/* BEDROOMS */}

              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                style={inputStyle}
              >
                <option value="">Bedrooms</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5+">5+ BHK</option>
              </select>

              {/* MIN PRICE */}

              <input
                type="number"
                placeholder="Minimum price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={inputStyle}
              />

              {/* MAX PRICE */}

              <input
                type="number"
                placeholder="Maximum price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={handleSearch}
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "13px 30px",
                  borderRadius: "6px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Search
              </button>

              <button
                onClick={clearFilters}
                style={{
                  background: "white",
                  color: "#333",
                  border: "1px solid #ddd",
                  padding: "13px 30px",
                  borderRadius: "6px",
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </section>

        {/* PROPERTY RESULTS */}

        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
              }}
            >
              Available Properties
            </h2>

            {!loading && (
              <span
                style={{
                  color: "#666",
                }}
              >
                {total} properties found
              </span>
            )}
          </div>

          {/* LOADING */}

          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#666",
              }}
            >
              Loading properties...
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div
              style={{
                background: "#fff",
                padding: "30px",
                textAlign: "center",
                borderRadius: "10px",
                color: "#d63031",
              }}
            >
              {error}
            </div>
          )}

          {/* NO RESULTS */}

          {!loading && !error && properties.length === 0 && (
            <div
              style={{
                background: "white",
                padding: "50px",
                textAlign: "center",
                borderRadius: "10px",
              }}
            >
              <h3>No properties found</h3>

              <p
                style={{
                  color: "#777",
                  marginTop: "10px",
                }}
              >
                Try changing your search filters.
              </p>
            </div>
          )}

          {/* PROPERTY GRID */}

          {!loading && !error && properties.length > 0 && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "25px",
                }}
              >
                {properties.map((property) => (
                  <PropertyCard
                    property={property}
                    key={property.id}
                  />
                ))}
              </div>

              {/* PAGINATION */}

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "14px",
                    marginTop: "30px",
                  }}
                >
                  <button
                    onClick={() =>
                      loadProperties(activeFilters, page - 1)
                    }
                    disabled={page === 1}
                    style={paginationButtonStyle}
                  >
                    Previous
                  </button>

                  <span
                    style={{
                      color: "#666",
                    }}
                  >
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      loadProperties(activeFilters, page + 1)
                    }
                    disabled={page === totalPages}
                    style={paginationButtonStyle}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px 15px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "15px",
  outline: "none",
  background: "white",
};

const paginationButtonStyle = {
  border: "1px solid #ddd",
  borderRadius: "6px",
  background: "white",
  color: "#333",
  cursor: "pointer",
  padding: "10px 16px",
};

export default Properties;