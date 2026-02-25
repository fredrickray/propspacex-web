const API_BASE_URL = "http://localhost:8000/api/v1";

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: AppRole;
  is_active: boolean;
}

interface Property {
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: Currency;
  location: IPropertyLocation;
  features: string[];
  size: IPropertySize;
  amenities: IPropertyAmenties[];
  media: {
    images: { url: string; mediaId: string }[];
    videos: { url: string; mediaId: string }[];
  };
  ownerId: string;
  blockchain?: {
    nftId?: string; // NFT certificate ID
    contractAddress?: string;
    transactionHash?: string;
  };
  isActive: boolean;
}

interface IPropertyLocation {
  address: string;
  suite?: string;
  city: string;
  state: string;
  country: string;
  coordinates: { type: "Point"; coordinates: [number, number] }; // GeoJSON
  neighborhoodHighlights?: {
    description?: string;
    tags?: string[];
  };
}

enum PropertyStatus {
  AVAILABLE = "available",
  RENTED = "rented",
  SOLD = "sold",
  PENDING = "pending",
}

enum PropertyType {
  APARTMENT = "apartment",
  HOUSE = "house",
  LAND = "land",
  COMMERCIAL = "commercial",
}

interface IPropertySize {
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  dimensionDetails?: {
    totalArea?: number; // in square meters
    lotSize?: number; // in square meters
    yearBuilt?: number; // in square meters
    propertyType?: string; // e.g., residential, commercial
  };
}

interface IPropertyAmenties {
  comfort?: string[];
  safety?: string[];
  recreation?: string[];
}

enum Currency {
  USD = "USD",
  NGN = "NGN",
  ETH = "ETH",
  USDT = "USDT",
}

enum AppRole {
  Buyer = "buyer",
  Seller = "seller",
  Agent = "agent",
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem("propspacex_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem("propspacex_token");
      localStorage.removeItem("propspacex_user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || "Request failed");
    }

    return response.json();
  }

  async signin(email: string, password: string): Promise<User> {
    const data = await this.request<{ token: string; user: User }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );

    localStorage.setItem("propspacex_token", data.token);
    localStorage.setItem("propspacex_user", JSON.stringify(data.user));
    return data.user;
  }

  async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    appRole: AppRole,
  ): Promise<User> {
    return this.request<User>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: appRole,
      }),
    });
  }

  async verify_otp(email: string, otp: string): Promise<void> {
    await this.request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  }

  async resend_otp(email: string): Promise<void> {
    await this.request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  signout() {
    localStorage.removeItem("propspacex_token");
    localStorage.removeItem("propspacex_user");
    window.location.href = "/login";
  }

  getProfile(): User | null {
    const userJson = localStorage.getItem("propspacex_user");
    return userJson ? JSON.parse(userJson) : null;
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  // Property api calls
  async getProperties(): Promise<any[]> {
    return this.request<any[]>("/properties");
  }

  async getPropertyById(id: string): Promise<any> {
    return this.request<any>(`/properties/${id}`);
  }

  async createProperty(data: {
    propertyData: Omit<
      Property,
      "media" | "ownerId" | "isActive" | "blockchain"
    >;
    images?: File[];
    videos?: File[];
    deedDocument?: File;
    inspectionReport?: File;
    appraisalReport?: File;
  }): Promise<any> {
    const token = this.getToken();
    const formData = new FormData();

    // Send property data as a single JSON string (backend parses req.body.propertyData)
    formData.append("propertyData", JSON.stringify(data.propertyData));

    // Append image files
    if (data.images?.length) {
      data.images.forEach((file) => formData.append("images", file));
    }

    // Append video files
    if (data.videos?.length) {
      data.videos.forEach((file) => formData.append("videos", file));
    }

    // Append document files
    if (data.deedDocument) {
      formData.append("deedDocument", data.deedDocument);
    }
    if (data.inspectionReport) {
      formData.append("inspectionReport", data.inspectionReport);
    }
    if (data.appraisalReport) {
      formData.append("appraisalReport", data.appraisalReport);
    }

    // Use fetch directly — do NOT set Content-Type; the browser sets it
    // automatically with the correct multipart boundary
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem("propspacex_token");
      localStorage.removeItem("propspacex_user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Request failed" }));
      throw new Error(
        error.detail || error.message || "Failed to create property",
      );
    }

    return response.json();
  }

  async getMyProperties(page = 1, limit = 10): Promise<any> {
    return this.request<any>(`/properties/my?page=${page}&limit=${limit}`);
  }

  async updateProperty(
    id: string,
    data: Partial<
      Omit<Property, "media" | "ownerId" | "isActive" | "blockchain">
    >,
  ): Promise<any> {
    return this.request(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: string): Promise<void> {
    await this.request(`/properties/${id}`, {
      method: "DELETE",
    });
  }
}
