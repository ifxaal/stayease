import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function PropertyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const averageRating = useMemo(
    () =>
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null,
    [reviews]
  );

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadPage = async () => {
      setLoading(true);
      setPageError("");
      try {
        const [propertyRes, bookingsRes, reviewsRes, meRes] = await Promise.allSettled([
          api.get(`/properties/${id}`, { signal: controller.signal }),
          api.get(`/bookings/property/${id}`, { signal: controller.signal }),
          api.get(`/reviews/property/${id}`, { signal: controller.signal }),
          api.get("/auth/me", { signal: controller.signal }),
        ]);

        if (!isMounted) return;

        if (propertyRes.status === "fulfilled") {
          setProperty(propertyRes.value.data);
        } else {
          setPageError("Unable to load this property.");
        }

        if (bookingsRes.status === "fulfilled") {
          const today = new Date();
          const booked = (bookingsRes.value.data || []).some((b) => {
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);
            return today >= start && today <= end;
          });
          setIsAvailable(!booked);
        }

        if (reviewsRes.status === "fulfilled") {
          setReviews(reviewsRes.value.data || []);
        }

        if (meRes.status === "fulfilled") {
          setCurrentUser(meRes.value.data);
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        if (isMounted) setPageError("Unable to load this property.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPage();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  const minStartDate = new Date().toISOString().split("T")[0];
  const minEndDate = startDate || minStartDate;
  const nights = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
    : 0;
  const estimatedTotal = property ? nights * Number(property.pricePerNight || 0) : 0;
  const canBook = isAvailable && startDate && endDate && nights > 0 && !submittingBooking;

  const handleBooking = async () => {
    setBookingError("");
    setBookingMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setBookingError("Please login to book this property.");
      return;
    }
    if (!startDate || !endDate) {
      setBookingError("Please select both check-in and check-out dates.");
      return;
    }
    if (nights <= 0) {
      setBookingError("Check-out date must be after check-in date.");
      return;
    }

    try {
      setSubmittingBooking(true);
      await api.post("/bookings", {
        propertyId: property._id,
        startDate,
        endDate,
      });
      setBookingMessage("Booking successful. You can view it in My Bookings.");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      setBookingError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleReview = async () => {
    setReviewError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setReviewError("Please login to add a review.");
      return;
    }
    if (!comment.trim()) {
      setReviewError("Review comment cannot be empty.");
      return;
    }

    try {
      setSubmittingReview(true);
      await api.post("/reviews", {
        propertyId: id,
        rating,
        comment,
      });

      const res = await api.get(`/reviews/property/${id}`);
      setReviews(res.data || []);
      setComment("");
    } catch (err) {
      setReviewError(err.response?.data?.message || "Review failed.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await api.delete(`/properties/${property._id}`);
      navigate("/");
    } catch (err) {
      setPageError("Delete failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gap: "0.8rem" }}>
        <div className="loading-block" />
        <div className="loading-block" />
      </div>
    );
  }

  if (!property) return <p className="status-error">{pageError || "Property not found."}</p>;

  return (
    <div className="panel" style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem" }}>
      {pageError && <p className="status-error">{pageError}</p>}

      <img
        src={
          property.image
            ? property.image.startsWith("http") ? property.image : `http://localhost:5000${property.image}`
            : property.images && property.images.length > 0
            ? property.images[0]
            : "/images/house1.jpg"
        }
        alt={property.title}
        style={{
          width: "100%",
          height: "450px",
          objectFit: "cover",
          borderRadius: "20px",
          marginBottom: "30px",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title" style={{ margin: 0 }}>{property.title}</h1>
        {currentUser && property.owner?._id === currentUser._id && (
          <button onClick={handleDelete} className="button button-danger">Delete</button>
        )}
      </div>

      <p className="muted" style={{ marginBottom: "15px" }}>📍 {property.location}</p>
      <p style={{ lineHeight: "1.6", marginBottom: "20px" }}>{property.description}</p>
      <div className="price" style={{ fontSize: "22px", marginBottom: "25px" }}>
        ₹{property.pricePerNight} / night
      </div>

      <div style={{ border: "1px solid #e4e7ec", padding: "20px", borderRadius: "16px", marginBottom: "40px" }}>
        <h3 style={{ marginBottom: "15px" }}>Book Your Stay</h3>

        <div className="property-meta-row" style={{ marginBottom: "10px" }}>
          <label>Check-in</label>
          <input
            type="date"
            min={minStartDate}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input date-input"
          />
        </div>

        <div className="property-meta-row" style={{ marginBottom: "8px" }}>
          <label>Check-out</label>
          <input
            type="date"
            min={minEndDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input date-input"
          />
        </div>

        {nights > 0 && (
          <p className="muted" style={{ margin: "0.4rem 0" }}>
            {nights} night(s) • Estimated total: ₹{estimatedTotal}
          </p>
        )}
        {!isAvailable && <p className="status-error">Currently not available for booking.</p>}
        {bookingError && <p className="status-error">{bookingError}</p>}
        {bookingMessage && <p className="status-success">{bookingMessage}</p>}

        <button
          onClick={handleBooking}
          disabled={!canBook}
          className="button button-primary"
          style={{ marginTop: "10px", opacity: canBook ? 1 : 0.65, cursor: canBook ? "pointer" : "not-allowed" }}
        >
          {submittingBooking ? "Booking..." : "Book Now"}
        </button>
      </div>

      <hr style={{ margin: "40px 0" }} />
      <h2 style={{ marginBottom: "10px" }}>
        Reviews {averageRating && `• ⭐ ${averageRating} (${reviews.length})`}
      </h2>

      {reviews.length === 0 && (
        <div className="empty-state" style={{ marginBottom: "0.8rem" }}>
          <p className="muted">No reviews yet.</p>
        </div>
      )}

      {reviews.map((r) => (
        <div
          key={r._id}
          style={{
            border: "1px solid #e4e7ec",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "12px",
            background: "#f8f9fc",
          }}
        >
          <strong>{r.user?.name}</strong>
          <p style={{ margin: "5px 0" }}>⭐ {r.rating} / 5</p>
          <p>{r.comment}</p>
        </div>
      ))}

      <div style={{ border: "1px solid #e4e7ec", padding: "20px", borderRadius: "16px", marginTop: "30px" }}>
        <h3 style={{ marginBottom: "15px" }}>Add Review</h3>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="select"
          style={{ width: "120px", marginBottom: "10px" }}
        >
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
        <textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="textarea"
          style={{ width: "100%", marginBottom: "15px", minHeight: "120px" }}
        />
        {reviewError && <p className="status-error">{reviewError}</p>}
        <button onClick={handleReview} className="button button-primary">
          {submittingReview ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

export default PropertyDetail;
