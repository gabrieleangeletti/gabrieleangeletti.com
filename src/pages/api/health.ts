import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

export const GET: APIRoute = async ({}) => {
  const hasApiUrl = !!env.VO2_API_BASE_URL;
  const hasApiKey = !!env.VO2_API_KEY;

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
