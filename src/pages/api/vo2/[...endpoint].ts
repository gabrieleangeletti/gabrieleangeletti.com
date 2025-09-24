import type { APIRoute } from "astro";

export const prerender = false;

export const ALL: APIRoute = async ({ params, request, locals }) => {
  const runtime = locals.runtime as { env: { VO2_API_BASE_URL: string; VO2_API_KEY: string } };

  const apiBaseUrl = runtime.env.VO2_API_BASE_URL;
  const apiKey = runtime.env.VO2_API_KEY;

  if (!apiBaseUrl || !apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "API configuration missing. Please set VO2_API_BASE_URL and VO2_API_KEY environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const endpoint = params.endpoint || "";

  const targetUrl = new URL(endpoint, apiBaseUrl);

  const url = new URL(request.url);
  targetUrl.search = url.search;

  try {
    const headers: Record<string, string> = {
      "x-vo2-api-key": apiKey,
      "Content-Type": "application/json",
      "User-Agent": "CloudFlare-Worker-Proxy/1.0",
    };

    const forwardHeaders = ["accept", "accept-language", "cache-control"];
    for (const headerName of forwardHeaders) {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers[headerName] = headerValue;
      }
    }

    const proxyRequest: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      proxyRequest.body = await request.text();
    }

    const response = await fetch(targetUrl.toString(), proxyRequest);

    const responseData = await response.text();

    const responseHeaders: Record<string, string> = {
      "Content-Type": response.headers.get("content-type") || "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    const forwardResponseHeaders = ["cache-control", "etag", "last-modified"];
    for (const headerName of forwardResponseHeaders) {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        responseHeaders[headerName] = headerValue;
      }
    }

    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to proxy request to API",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
};
