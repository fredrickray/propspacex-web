const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9099/api/v1";

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  appRole: AppRole;
  isVerified: boolean;
}

export interface Property {
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

export interface IPropertyLocation {
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

export enum PropertyStatus {
  AVAILABLE = "available",
  RENTED = "rented",
  SOLD = "sold",
  PENDING = "pending",
}

export enum PropertyType {
  APARTMENT = "apartment",
  HOUSE = "house",
  LAND = "land",
  COMMERCIAL = "commercial",
}

export interface IPropertySize {
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

export interface IPropertyAmenties {
  comfort?: string[];
  safety?: string[];
  recreation?: string[];
}

export enum Currency {
  USD = "USD",
  NGN = "NGN",
  ETH = "ETH",
  USDT = "USDT",
}

export enum AppRole {
  Admin = "admin",
  Buyer = "buyer",
  Agent = "agent",
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type CreatePropertyRequest = {
  propertyData: Omit<Property, "media" | "ownerId" | "isActive" | "blockchain">;
  images?: File[];
  videos?: File[];
  deedDocument?: File;
  inspectionReport?: File;
  appraisalReport?: File;
};

class ApiClient {
  private readonly authCookieName = "propspacex_auth_token";
  private readonly roleCookieName = "propspacex_role";
  private readonly profileCookieName = "propspacex_user";

  private getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const encodedName = `${name}=`;
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith(encodedName));
    if (!cookie) return null;
    return decodeURIComponent(cookie.substring(encodedName.length));
  }

  private getToken(): string | null {
    return this.getCookie(this.authCookieName);
  }

  private setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24) {
    if (typeof document === "undefined") return;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
  }

  private clearCookie(name: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  }

  private setSession(response: AuthResponse) {
    this.setCookie(this.authCookieName, response.accessToken);
    this.setCookie(this.roleCookieName, response.user.appRole);
    this.setCookie(this.profileCookieName, JSON.stringify(response.user));
  }

  private clearSession() {
    this.clearCookie(this.authCookieName);
    this.clearCookie(this.roleCookieName);
    this.clearCookie(this.profileCookieName);
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return undefined as T;
    }

    return response.json();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    { skipAuthRedirect = false } = {},
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
      credentials: "include",
    });

    if (response.status === 401 && !skipAuthRedirect) {
      this.clearSession();
      window.location.href = "/auth/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || error.detail || "Request failed");
    }

    return this.parseResponse<T>(response);
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      "/auth/signin",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      { skipAuthRedirect: true },
    );

    this.setSession(response);
    return response;
  }

  async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    appRole: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      "/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          appRole,
        }),
      },
      { skipAuthRedirect: true },
    );
  }

  async verify_otp(email: string, otp: string): Promise<void> {
    await this.request(
      "/auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      },
      { skipAuthRedirect: true },
    );
  }

  async resend_otp(email: string): Promise<void> {
    await this.request(
      "/auth/resend-otp",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      { skipAuthRedirect: true },
    );
  }

  signout() {
    this.clearSession();
    window.location.href = "/auth/login";
  }

  getProfile(): User | null {
    const userJson = this.getCookie(this.profileCookieName);
    return userJson ? JSON.parse(userJson) : null;
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  // Property api calls
  async getProperties(): Promise<unknown[]> {
    return this.request<unknown[]>("/properties");
  }

  async getPropertyById(id: string): Promise<unknown> {
    return this.request<unknown>(`/properties/${id}`);
  }

  async createProperty(data: CreatePropertyRequest): Promise<unknown> {
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
      credentials: "include",
    });

    if (response.status === 401) {
      this.clearSession();
      window.location.href = "/auth/login";
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

    return this.parseResponse<unknown>(response);
  }

  async getMyProperties(page = 1, limit = 10): Promise<unknown> {
    return this.request<unknown>(`/agents/properties?page=${page}&limit=${limit}`);
  }

  async updateProperty(
    id: string,
    data: Partial<
      Omit<Property, "media" | "ownerId" | "isActive" | "blockchain">
    >,
  ): Promise<unknown> {
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

export const api = new ApiClient();
