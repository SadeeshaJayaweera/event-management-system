// Determine API URL intelligently based on environment
let API_BASE_URL: string;

// Check if we have a vite environment variable (takes precedence)
if (import.meta.env.VITE_API_URL) {
  API_BASE_URL = import.meta.env.VITE_API_URL;
}
// Use empty base URL since all API calls already include /api prefix
// nginx will proxy /api/* requests to the gateway
else {
  API_BASE_URL = '';
}

// Log the API URL for debugging
console.log("🔧 API Base URL:", API_BASE_URL);
console.log("🔧 Hostname:", typeof window !== 'undefined' ? window.location.hostname : 'server');
console.log("🔧 Environment:", import.meta.env.MODE);
console.log("🔧 VITE_API_URL:", import.meta.env.VITE_API_URL || 'not set');

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

// Token storage - will be set by AuthContext
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Inject auth token if available
  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const url = `${API_BASE_URL}${path}`;
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    console.log(`✅ API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const message = await response.text();
      console.error(`❌ API Error: ${response.status} - ${message}`);
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`❌ API Request Failed:`, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Make sure the backend services are running.`);
    }
    throw error;
  }
}

export { API_BASE_URL };
