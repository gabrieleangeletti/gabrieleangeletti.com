/**
 * Utility functions for making API calls through the CloudFlare Worker proxy
 */

import { QueryClient } from "@tanstack/react-query";

const API_BASE = "/api/vo2";

export const client = new QueryClient();

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Makes a GET request to the VO2 API through the CloudFlare Worker proxy
 */
export async function vo2Get<T>(
  endpoint: string,
  searchParams?: Record<string, string>,
): Promise<ApiResponse<T>> {
  try {
    const url = new URL(`${API_BASE}/${endpoint}`, window.location.origin);

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Makes a POST request to the VO2 API through the CloudFlare Worker proxy
 */
export async function vo2Post<T, U>(endpoint: string, body: U): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}/${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Makes a PUT request to the VO2 API through the CloudFlare Worker proxy
 */
export async function vo2Put<T, U>(endpoint: string, body: U): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}/${endpoint}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Makes a DELETE request to the VO2 API through the CloudFlare Worker proxy
 */
export async function vo2Delete<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}/${endpoint}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
