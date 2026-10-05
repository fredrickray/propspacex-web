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
  purpose?: "sale" | "rent";
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
  NAIRA = "NGN",
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

export interface Web3NonceResponse {
  success: boolean;
  message: string;
  nonce?: string;
}

export interface EscrowPaymentIntentResponse {
  success: boolean;
  message: string;
  payment_id: string;
  provider_reference: string;
  payment_link: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  payment_id: string;
  provider_reference: string;
  status: string;
  escrow_id?: string;
  user_id?: string;
}

export interface WalletResponse {
  success: boolean;
  message: string;
  wallet?: {
    wallet_id: string;
    user_id: string;
    total_balance_minor: number | string;
    available_balance_minor: number | string;
    held_balance_minor: number | string;
  };
}

export interface EscrowListResponse {
  success: boolean;
  escrows?: Array<Record<string, unknown>>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
  };
}

export interface WithdrawalListResponse {
  success: boolean;
  withdrawals?: Array<Record<string, unknown>>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
  };
}

export type CreatePropertyRequest = {
  propertyData: Omit<Property, "media" | "ownerId" | "isActive" | "blockchain">;
  images?: File[];
  videos?: File[];
  deedDocument?: File;
  inspectionReport?: File;
  appraisalReport?: File;
};

function accountText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function parseAccountUser(data: unknown, fallback: User | null): User | null {
  const root =
    data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const nested = root?.user;
  const row =
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>)
      : root;
  if (!row) return fallback;

  const userId = accountText(row.userId, row.id, row._id) || fallback?.userId || "";
  const email = accountText(row.email) || fallback?.email || "";
  if (!userId && !email) return fallback;

  const role = accountText(row.appRole, row.role).toLowerCase();
  return {
    userId,
    email,
    firstName: accountText(row.firstName, row.first_name) || fallback?.firstName || "",
    lastName: accountText(row.lastName, row.last_name) || fallback?.lastName || "",
    phone: accountText(row.phone) || fallback?.phone || "",
    appRole:
      role === AppRole.Admin || role === AppRole.Agent || role === AppRole.Buyer
        ? role
        : fallback?.appRole ?? AppRole.Buyer,
    isVerified:
      typeof row.isVerified === "boolean"
        ? row.isVerified
        : (fallback?.isVerified ?? false),
  };
}

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

  getAccessToken(): string | null {
    return this.getToken();
  }

  getBaseUrl(): string {
    return API_BASE_URL;
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

  private isAuthErrorText(text?: string): boolean {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return [
      "token has expired",
      "token expired",
      "jwt expired",
      "invalid token",
      "token is invalid",
      "unauthorized",
      "authentication failed",
      "not authenticated",
      "invalid signature",
    ].some((value) => normalized.includes(value));
  }

  private redirectToLogin() {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }

  private async parseError(
    response: Response,
    fallback: string,
  ): Promise<{ message: string; details?: string }> {
    const errorPayload = await response.json().catch(() => ({}));
    const details =
      typeof errorPayload.details === "string"
        ? errorPayload.details
        : typeof errorPayload.detail === "string"
          ? errorPayload.detail
          : undefined;
    const message =
      typeof errorPayload.message === "string" ? errorPayload.message : undefined;

    return {
      message: details ?? message ?? fallback,
      details,
    };
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
      this.redirectToLogin();
      const parsed = await this.parseError(response, "Unauthorized");
      throw new Error(parsed.message);
    }

    if (!response.ok) {
      const parsed = await this.parseError(response, "Request failed");

      if (!skipAuthRedirect && this.isAuthErrorText(parsed.message)) {
        this.clearSession();
        this.redirectToLogin();
      }

      throw new Error(parsed.message);
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

  async requestPasswordReset(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.request(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      { skipAuthRedirect: true },
    );
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.request(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ token, password }),
      },
      { skipAuthRedirect: true },
    );
  }

  async requestWeb3Nonce(
    walletAddress: string,
    appRole?: "buyer" | "agent",
  ): Promise<Web3NonceResponse> {
    const payload: { walletAddress: string; appRole?: "buyer" | "agent" } = {
      walletAddress,
    };
    if (appRole !== undefined) {
      payload.appRole = appRole;
    }

    const response = await this.request<{
      success?: boolean;
      message?: string;
      nonce?: string;
      data?: { nonce?: string; message?: string };
    }>(
      "/auth/request-web3-nonce",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      { skipAuthRedirect: true },
    );

    const nonce =
      response.nonce ??
      response.data?.nonce ??
      response.data?.message ??
      response.message;

    return {
      success: Boolean(response.success ?? true),
      message: response.message ?? "Nonce generated",
      nonce,
    };
  }

  async verifyWeb3Signature(
    walletAddress: string,
    signature: string,
    message: string,
  ): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      "/auth/verify-web3-signature",
      {
        method: "POST",
        body: JSON.stringify({ walletAddress, signature, message }),
      },
      { skipAuthRedirect: true },
    );

    this.setSession(response);
    return response;
  }

  async linkWeb3Wallet(
    walletAddress: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      "/auth/link-web3-wallet",
      {
        method: "POST",
        body: JSON.stringify({ walletAddress }),
      },
      { skipAuthRedirect: false },
    );
  }

  signout() {
    this.clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }

  getProfile(): User | null {
    const userJson = this.getCookie(this.profileCookieName);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }

  storeProfile(user: User) {
    const current = this.getProfile();
    this.setCookie(
      this.profileCookieName,
      JSON.stringify({ ...current, ...user }),
    );
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("propspacex-profile-updated"));
    }
  }

  async fetchProfile(): Promise<User> {
    const data = await this.request<unknown>("/users/profile");
    const user = parseAccountUser(data, this.getProfile());
    if (!user) throw new Error("Profile was not returned.");
    this.storeProfile(user);
    return user;
  }

  async updateMyProfile(input: {
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<User> {
    await this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return this.fetchProfile();
  }

  async deleteMyAccount(): Promise<void> {
    await this.request("/users/account", { method: "DELETE" });
    this.signout();
  }

  async getUsers(page = 1, limit = 100): Promise<unknown> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return this.request(`/users?${params.toString()}`, {}, { skipAuthRedirect: true });
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  // Property api calls
  async getProperties(options?: {
    skipAuthRedirect?: boolean;
    status?: PropertyStatus;
    purpose?: "sale" | "rent";
    page?: number;
    limit?: number;
  }): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (options?.status) params.set("status", options.status);
    if (options?.purpose) params.set("purpose", options.purpose);
    if (options?.page) params.set("page", String(options.page));
    if (options?.limit) params.set("limit", String(options.limit));
    const query = params.toString();
    return this.request<unknown[]>(
      `/properties${query ? `?${query}` : ""}`,
      {},
      { skipAuthRedirect: options?.skipAuthRedirect },
    );
  }

  async approveProperty(id: string): Promise<unknown> {
    return this.request(`/admin/properties/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async rejectProperty(id: string, reason: string): Promise<unknown> {
    return this.request(`/admin/properties/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async escalateProperty(id: string, note: string): Promise<unknown> {
    return this.request(`/admin/properties/${id}/escalate`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  }

  async getPropertyById(
    id: string,
    options?: { skipAuthRedirect?: boolean },
  ): Promise<unknown> {
    return this.request<unknown>(`/properties/${id}`, {}, options);
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

    const response = await fetch(`${API_BASE_URL}/agents/properties`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    if (response.status === 401) {
      this.clearSession();
      this.redirectToLogin();
      const parsed = await this.parseError(response, "Unauthorized");
      throw new Error(parsed.message);
    }

    if (!response.ok) {
      const parsed = await this.parseError(response, "Failed to create property");
      if (this.isAuthErrorText(parsed.message)) {
        this.clearSession();
        this.redirectToLogin();
      }
      throw new Error(parsed.message);
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
    return this.request(`/agents/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: string): Promise<void> {
    await this.request(`/agents/properties/${id}`, {
      method: "DELETE",
    });
  }

  async createEscrowPaymentIntent(input: {
    escrow_id: string;
    amount_minor: number;
    currency_code: number;
    idempotency_key: string;
    provider?: string;
    callback_url?: string;
  }): Promise<EscrowPaymentIntentResponse> {
    const profile = this.getProfile();
    return this.request<EscrowPaymentIntentResponse>("/payments/intent", {
      method: "POST",
      body: JSON.stringify({
        buyer_user_id: profile?.userId,
        email: profile?.email,
        provider: input.provider ?? "paystack",
        escrow_id: input.escrow_id,
        amount_minor: input.amount_minor,
        currency_code: input.currency_code,
        idempotency_key: input.idempotency_key,
        purpose: 1,
        callback_url: input.callback_url,
      }),
    });
  }

  async verifyEscrowPaymentByReference(
    provider: string,
    reference: string,
  ): Promise<VerifyPaymentResponse> {
    return this.request<VerifyPaymentResponse>("/payments/verify", {
      method: "POST",
      body: JSON.stringify({ provider, reference }),
    });
  }

  async createWalletTopupIntent(input: {
    amount_minor: number;
    currency_code: number;
    idempotency_key: string;
    provider?: string;
    callback_url?: string;
  }): Promise<EscrowPaymentIntentResponse> {
    const profile = this.getProfile();
    return this.request<EscrowPaymentIntentResponse>("/payments/wallet-topup/intent", {
      method: "POST",
      body: JSON.stringify({
        user_id: profile?.userId,
        email: profile?.email,
        provider: input.provider ?? "paystack",
        amount_minor: input.amount_minor,
        currency_code: input.currency_code,
        idempotency_key: input.idempotency_key,
        callback_url: input.callback_url,
      }),
    });
  }

  async verifyWalletTopupByReference(
    provider: string,
    reference: string,
  ): Promise<VerifyPaymentResponse> {
    return this.request<VerifyPaymentResponse>("/payments/wallet-topup/verify", {
      method: "POST",
      body: JSON.stringify({ provider, reference }),
    });
  }

  async releaseEscrow(input: { escrow_id: string; idempotency_key: string; note?: string }) {
    const profile = this.getProfile();
    return this.request(`/escrows/${input.escrow_id}/release`, {
      method: "POST",
      body: JSON.stringify({
        buyer_user_id: profile?.userId,
        idempotency_key: input.idempotency_key,
        note: input.note,
      }),
    });
  }

  async markEscrowServiceComplete(input: {
    escrow_id: string;
    idempotency_key: string;
    note?: string;
  }) {
    const profile = this.getProfile();
    return this.request(`/escrows/${input.escrow_id}/mark-complete`, {
      method: "POST",
      body: JSON.stringify({
        agent_user_id: profile?.userId,
        idempotency_key: input.idempotency_key,
        note: input.note,
      }),
    });
  }

  async requestWithdrawal(input: {
    amount_minor: number;
    bank_code: string;
    account_number: string;
    account_name: string;
    idempotency_key: string;
  }) {
    return this.request("/wallets/withdrawals", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async getMyWallet(): Promise<WalletResponse> {
    return this.request<WalletResponse>("/wallets/me");
  }

  async listEscrowsByUser(input?: {
    role?: number;
    status?: number;
    page?: number;
    limit?: number;
  }): Promise<EscrowListResponse> {
    const query = new URLSearchParams();
    query.set("page", String(input?.page ?? 1));
    query.set("limit", String(input?.limit ?? 50));
    if (typeof input?.role === "number") query.set("role", String(input.role));
    if (typeof input?.status === "number") query.set("status", String(input.status));
    const qs = query.toString();
    return this.request<EscrowListResponse>(`/escrows${qs ? `?${qs}` : ""}`);
  }

  async listDeals(page = 1, limit = 50): Promise<unknown> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return this.request(`/deals?${query.toString()}`);
  }

  async getDeal(dealId: string): Promise<unknown> {
    return this.request(`/deals/${dealId}`);
  }

  async createOrGetDeal(
    conversationId: string,
    propertyTitle?: string,
    source: "website" | "referral" | "social" | "portal" = "website",
  ): Promise<unknown> {
    return this.request("/deals", {
      method: "POST",
      body: JSON.stringify({
        conversationId,
        propertyTitle: propertyTitle ?? "",
        source,
      }),
    });
  }

  async recordPropertyView(id: string): Promise<void> {
    await this.request(
      `/properties/${encodeURIComponent(id)}/views`,
      { method: "POST" },
      { skipAuthRedirect: true },
    );
  }

  async getAgentAnalytics(): Promise<unknown> {
    return this.request("/agents/analytics");
  }

  async quoteDeal(
    dealId: string,
    input: { amountMinor: number; platformFeeMinor: number; quoteNote?: string },
  ): Promise<unknown> {
    return this.request(`/deals/${dealId}/quote`, {
      method: "POST",
      body: JSON.stringify({
        amountMinor: input.amountMinor,
        platformFeeMinor: input.platformFeeMinor,
        quoteNote: input.quoteNote ?? "",
      }),
    });
  }

  async acceptDealQuote(dealId: string, idempotencyKey: string): Promise<unknown> {
    return this.request(`/deals/${dealId}/accept-quote`, {
      method: "POST",
      body: JSON.stringify({ idempotencyKey }),
    });
  }

  async getVerifications(page = 1, limit = 50): Promise<unknown> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return this.request(`/admin/verifications?${query.toString()}`);
  }

  async listMyWithdrawals(input?: {
    status?: number;
    page?: number;
    limit?: number;
  }): Promise<WithdrawalListResponse> {
    const query = new URLSearchParams();
    query.set("page", String(input?.page ?? 1));
    query.set("limit", String(input?.limit ?? 50));
    if (typeof input?.status === "number") query.set("status", String(input.status));
    const qs = query.toString();
    return this.request<WithdrawalListResponse>(`/wallets/withdrawals/me?${qs}`);
  }
}

export const api = new ApiClient();
