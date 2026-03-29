// Property creation data interface for Add Property form and API
export interface PropertyLocation {
  address: string;
  unit?: string;
  zip?: string;
  city: string;
  state: string;
  country: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  neighborhoodHighlights: {
    description: string;
    tags: string[];
  };
}

export interface PropertySize {
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  dimensionDetails: {
    totalArea: number;
    lotSize: number;
    yearBuilt: number;
    propertyType: string;
  };
}

export interface PropertyAmenities {
  comfort: string[];
  safety: string[];
  recreation: string[];
}

export interface CreatePropertyPayload {
  title: string;
  description: string;
  type: string;
  status: string;
  price: number;
  currency: string;
  location: PropertyLocation;
  size: PropertySize;
  features: string[];
  amenities: PropertyAmenities[];
  images: File[];
  videos: File[];
  deedDocument?: File;
  inspectionReport?: File;
  appraisalReport?: File;
}
