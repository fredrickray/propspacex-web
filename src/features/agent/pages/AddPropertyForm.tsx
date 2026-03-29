import React, { useState } from "react";
import {
  CreatePropertyPayload,
  PropertyAmenities,
  PropertyLocation,
  PropertySize,
} from "./types";

interface AddPropertyFormProps {
  onSubmit: (data: FormData) => void;
  loading?: boolean;
  error?: string | null;
}

const defaultLocation: PropertyLocation = {
  address: "",
  city: "",
  state: "",
  country: "",
  coordinates: { type: "Point", coordinates: [0, 0] },
  neighborhoodHighlights: { description: "", tags: [] },
};

const defaultSize: PropertySize = {
  bedrooms: 0,
  bathrooms: 0,
  parkingSpaces: 0,
  dimensionDetails: {
    totalArea: 0,
    lotSize: 0,
    yearBuilt: 0,
    propertyType: "",
  },
};

const defaultAmenities: PropertyAmenities = {
  comfort: [],
  safety: [],
  recreation: [],
};

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({
  onSubmit,
  loading,
  error,
}) => {
  const [form, setForm] = useState<
    Omit<
      CreatePropertyPayload,
      | "images"
      | "videos"
      | "deedDocument"
      | "inspectionReport"
      | "appraisalReport"
    >
  >({
    title: "",
    description: "",
    type: "",
    status: "",
    price: 0,
    currency: "",
    location: defaultLocation,
    size: defaultSize,
    features: [],
    amenities: [defaultAmenities],
  });
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [deedDocument, setDeedDocument] = useState<File | null>(null);
  const [inspectionReport, setInspectionReport] = useState<File | null>(null);
  const [appraisalReport, setAppraisalReport] = useState<File | null>(null);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle nested object changes (location, size, etc.)
  const handleNestedChange = (
    section: keyof typeof form,
    key: string,
    value: any,
  ) => {
    const sectionValue = form[section];
    if (typeof sectionValue !== "object" || sectionValue === null) return;

    setForm((prev) => ({
      ...prev,
      [section]: {
        ...((prev[section] as unknown) as Record<string, unknown>),
        [key]: value,
      },
    }));
  };

  // Handle features (comma separated)
  const handleFeaturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      features: e.target.value
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    }));
  };

  // Handle amenities (for simplicity, one object)
  const handleAmenitiesChange = (
    section: keyof PropertyAmenities,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      amenities: [
        {
          ...prev.amenities[0],
          [section]: value
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        },
      ],
    }));
  };

  // Handle file inputs
  const handleFileChange =
    (setter: React.Dispatch<React.SetStateAction<any>>, multiple = false) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      if (multiple) setter(Array.from(e.target.files));
      else setter(e.target.files[0] || null);
    };

  // Handle coordinates
  const handleCoordinatesChange = (index: 0 | 1, value: string) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          coordinates: prev.location.coordinates.coordinates.map((c, i) =>
            i === index ? Number(value) : c,
          ) as [number, number],
        },
      },
    }));
  };

  // Handle neighborhood tags
  const handleNeighborhoodTagsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        neighborhoodHighlights: {
          ...prev.location.neighborhoodHighlights,
          tags: e.target.value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      },
    }));
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === "object") {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, value as any);
      }
    });
    images.forEach((file) => data.append("images", file));
    videos.forEach((file) => data.append("videos", file));
    if (deedDocument) data.append("deedDocument", deedDocument);
    if (inspectionReport) data.append("inspectionReport", inspectionReport);
    if (appraisalReport) data.append("appraisalReport", appraisalReport);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div>
        <label>Type</label>
        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div>
        <label>Status</label>
        <input
          name="status"
          value={form.status}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div>
        <label>Price</label>
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div>
        <label>Currency</label>
        <input
          name="currency"
          value={form.currency}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      {/* Location fields */}
      <fieldset>
        <legend>Location</legend>
        <input
          placeholder="Address"
          value={form.location.address}
          onChange={(e) =>
            handleNestedChange("location", "address", e.target.value)
          }
          className="input"
        />
        <input
          placeholder="City"
          value={form.location.city}
          onChange={(e) =>
            handleNestedChange("location", "city", e.target.value)
          }
          className="input"
        />
        <input
          placeholder="State"
          value={form.location.state}
          onChange={(e) =>
            handleNestedChange("location", "state", e.target.value)
          }
          className="input"
        />
        <input
          placeholder="Country"
          value={form.location.country}
          onChange={(e) =>
            handleNestedChange("location", "country", e.target.value)
          }
          className="input"
        />
        <input
          placeholder="Longitude"
          type="number"
          value={form.location.coordinates.coordinates[0]}
          onChange={(e) => handleCoordinatesChange(0, e.target.value)}
          className="input"
        />
        <input
          placeholder="Latitude"
          type="number"
          value={form.location.coordinates.coordinates[1]}
          onChange={(e) => handleCoordinatesChange(1, e.target.value)}
          className="input"
        />
        <input
          placeholder="Neighborhood Description"
          value={form.location.neighborhoodHighlights.description}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                neighborhoodHighlights: {
                  ...prev.location.neighborhoodHighlights,
                  description: e.target.value,
                },
              },
            }))
          }
          className="input"
        />
        <input
          placeholder="Neighborhood Tags (comma separated)"
          value={form.location.neighborhoodHighlights.tags.join(", ")}
          onChange={handleNeighborhoodTagsChange}
          className="input"
        />
      </fieldset>
      {/* Size fields */}
      <fieldset>
        <legend>Size</legend>
        <input
          placeholder="Bedrooms"
          type="number"
          value={form.size.bedrooms}
          onChange={(e) =>
            handleNestedChange("size", "bedrooms", Number(e.target.value))
          }
          className="input"
        />
        <input
          placeholder="Bathrooms"
          type="number"
          value={form.size.bathrooms}
          onChange={(e) =>
            handleNestedChange("size", "bathrooms", Number(e.target.value))
          }
          className="input"
        />
        <input
          placeholder="Parking Spaces"
          type="number"
          value={form.size.parkingSpaces}
          onChange={(e) =>
            handleNestedChange("size", "parkingSpaces", Number(e.target.value))
          }
          className="input"
        />
        <input
          placeholder="Total Area"
          type="number"
          value={form.size.dimensionDetails.totalArea}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              size: {
                ...prev.size,
                dimensionDetails: {
                  ...prev.size.dimensionDetails,
                  totalArea: Number(e.target.value),
                },
              },
            }))
          }
          className="input"
        />
        <input
          placeholder="Lot Size"
          type="number"
          value={form.size.dimensionDetails.lotSize}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              size: {
                ...prev.size,
                dimensionDetails: {
                  ...prev.size.dimensionDetails,
                  lotSize: Number(e.target.value),
                },
              },
            }))
          }
          className="input"
        />
        <input
          placeholder="Year Built"
          type="number"
          value={form.size.dimensionDetails.yearBuilt}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              size: {
                ...prev.size,
                dimensionDetails: {
                  ...prev.size.dimensionDetails,
                  yearBuilt: Number(e.target.value),
                },
              },
            }))
          }
          className="input"
        />
        <input
          placeholder="Property Type"
          value={form.size.dimensionDetails.propertyType}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              size: {
                ...prev.size,
                dimensionDetails: {
                  ...prev.size.dimensionDetails,
                  propertyType: e.target.value,
                },
              },
            }))
          }
          className="input"
        />
      </fieldset>
      {/* Features */}
      <div>
        <label>Features (comma separated)</label>
        <input
          value={form.features.join(", ")}
          onChange={handleFeaturesChange}
          className="input"
        />
      </div>
      {/* Amenities */}
      <fieldset>
        <legend>Amenities</legend>
        <input
          placeholder="Comfort (comma separated)"
          value={form.amenities[0].comfort.join(", ")}
          onChange={(e) => handleAmenitiesChange("comfort", e.target.value)}
          className="input"
        />
        <input
          placeholder="Safety (comma separated)"
          value={form.amenities[0].safety.join(", ")}
          onChange={(e) => handleAmenitiesChange("safety", e.target.value)}
          className="input"
        />
        <input
          placeholder="Recreation (comma separated)"
          value={form.amenities[0].recreation.join(", ")}
          onChange={(e) => handleAmenitiesChange("recreation", e.target.value)}
          className="input"
        />
      </fieldset>
      {/* File uploads */}
      <div>
        <label>Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange(setImages, true)}
        />
      </div>
      <div>
        <label>Videos</label>
        <input
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileChange(setVideos, true)}
        />
      </div>
      <div>
        <label>Deed Document</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange(setDeedDocument)}
        />
      </div>
      <div>
        <label>Inspection Report</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange(setInspectionReport)}
        />
      </div>
      <div>
        <label>Appraisal Report</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange(setAppraisalReport)}
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Submitting..." : "Create Property"}
      </button>
    </form>
  );
};
