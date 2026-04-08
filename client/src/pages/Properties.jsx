import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Properties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    sortOrder: "",
  });
  const [queryFilters, setQueryFilters] = useState(filters);
  const [filterError, setFilterError] = useState("");

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const min = Number(filters.minPrice || 0);
    const max = Number(filters.maxPrice || 0);

    if (filters.minPrice && min < 0) {
      setFilterError("Minimum price cannot be negative.");
      return;
    }
    if (filters.maxPrice && max < 0) {
      setFilterError("Maximum price cannot be negative.");
      return;
    }
    if (filters.minPrice && filters.maxPrice && min > max) {
      setFilterError("Minimum price must be less than or equal to maximum price.");
      return;
    }

    setFilterError("");
    setQueryFilters(filters);
  };

  const clearFilters = () => {
    const reset = { location: "", minPrice: "", maxPrice: "", sortOrder: "" };
    setFilters(reset);
    setQueryFilters(reset);
    setFilterError("");
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setLoading(true);
    setError("");

    api
      .get("/properties", {
        params: {
          location: queryFilters.location,
          minPrice: queryFilters.minPrice || undefined,
          maxPrice: queryFilters.maxPrice || undefined,
          sortOrder: queryFilters.sortOrder,
        },
        signal: controller.signal,
      })
      .then((res) => {
        if (!isMounted) return;
        setProperties(res.data || []);
      })
      .catch((err) => {
        if (!isMounted || err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        setError("Unable to load properties. Please try again.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [queryFilters]);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: "0.8rem" }}>
        <div className="loading-block" />
        <div className="loading-block" />
        <div className="loading-block" />
      </div>
    );
  }

  return (
    <div>
      <section className="panel" style={{ padding: "1.2rem", marginBottom: "1.4rem" }}>
        <h1 className="hero-title">Discover Your Next Stay</h1>
        <p className="muted hero-subtext">Find and Book Unique Stays with Ease</p>
      </section>

      <section className="panel" style={{ padding: "1rem", marginBottom: "1.4rem" }}>
        <div className="filter-grid">
          <input
            type="text"
            placeholder="Search by location"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="input"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="input"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="input"
          />
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            className="select"
          >
            <option value="">Sort by</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
        {filterError && <p className="status-error">{filterError}</p>}
        <div className="filter-actions">
          <button type="button" className="button" onClick={clearFilters}>
            Clear
          </button>
          <button type="button" className="button button-primary" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </section>

      {error && <p className="status-error">{error}</p>}

      {!error && properties.length === 0 && (
        <div className="empty-state">
          <p className="muted" style={{ marginBottom: "0.7rem" }}>
            No properties match your filters.
          </p>
          <button type="button" className="button button-primary" onClick={clearFilters}>
            Reset filters
          </button>
        </div>
      )}

      <div className="grid">
        {properties.map((p, index) => {
          const fallbackImages = ["/images/house1.jpg", "/images/house2.jpg", "/images/house3.jpg"];
          return (
            <div
              key={p._id}
              onClick={() => navigate(`/properties/${p._id}`)}
              className="property-card"
            >
              <img
                src={
                  p.image
                    ? p.image.startsWith("http") ? p.image : `http://localhost:5000${p.image}`
                    : p.images && p.images.length > 0
                    ? p.images[0]
                    : fallbackImages[index % fallbackImages.length]
                }
                alt={p.title}
              />
              <div className="property-card-body">
                <h3 className="property-title">{p.title}</h3>
                <p className="muted" style={{ margin: "0.35rem 0 0" }}>{p.location}</p>
                <p className="price">₹{p.pricePerNight} / night</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Properties;
