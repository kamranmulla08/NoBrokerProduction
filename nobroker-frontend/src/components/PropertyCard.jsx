import { useState } from "react";
import { Link } from "react-router-dom";
import { getPropertyImageUrl } from "../utils/propertyMedia";
import "./PropertyCard.css";

function PropertyCard({ property }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imagePath = property.images?.[0]?.image;
  const imageUrl = getPropertyImageUrl(imagePath);
  const hasBedrooms = property.bedrooms !== null && property.bedrooms !== undefined;
  const hasBathrooms = property.bathrooms !== null && property.bathrooms !== undefined;
  const hasArea = property.area !== null && property.area !== undefined;
  const isRent = property.listing_type === "RENT";

  return (
    <Link className="property-card" to={`/properties/${property.id}`}>
      <div className="property-card-image-wrap">
        {imageUrl && !imageFailed ? (
          <img
            className="property-card-image"
            src={imageUrl}
            alt={property.title}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="property-card-placeholder" role="img" aria-label="No property image available">
            <span>No image available</span>
          </div>
        )}
        <span className={`property-card-badge ${isRent ? "rent" : "sale"}`}>
          {isRent ? "For rent" : "For sale"}
        </span>
      </div>

      <div className="property-card-body">
        <div className="property-card-category">{property.property_type || "Property"}</div>
        <h3>{property.title}</h3>
        <p className="property-card-location">
          <span aria-hidden="true">⌖</span>
          {property.city || "Location unavailable"}
        </p>

        <div className="property-card-features">
          {hasBedrooms && <span><strong>{property.bedrooms}</strong> Beds</span>}
          {hasBathrooms && <span><strong>{property.bathrooms}</strong> Baths</span>}
          {hasArea && <span><strong>{property.area}</strong> sq.ft</span>}
        </div>

        <div className="property-card-footer">
          <div>
            <strong>₹{Number(property.price || 0).toLocaleString("en-IN")}</strong>
            {isRent && <small>Monthly rent</small>}
          </div>
          <span className="property-card-action">View details <b>→</b></span>
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;
