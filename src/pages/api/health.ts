import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const runtime = locals.runtime as { env: { VO2_API_BASE_URL?: string; VO2_API_KEY?: string } };

  const hasApiUrl = !!runtime.env?.VO2_API_BASE_URL;
  const hasApiKey = !!runtime.env?.VO2_API_KEY;

  return new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      proxy: {
        configured: hasApiUrl && hasApiKey,
        hasApiUrl,
        hasApiKey,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};
