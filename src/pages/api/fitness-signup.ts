import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, turnstileToken } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const runtime = locals.runtime as {
      env: {
        RESEND_API_KEY?: string;
        NOTIFICATION_EMAIL?: string;
        TURNSTILE_SECRET_KEY?: string;
      };
    };
    const apiKey = runtime.env?.RESEND_API_KEY;
    const toEmail = runtime.env?.NOTIFICATION_EMAIL;
    const turnstileSecret = runtime.env?.TURNSTILE_SECRET_KEY;

    if (!turnstileSecret) {
      console.warn("Turnstile not configured, skipping verification");
    } else if (!turnstileToken) {
      return new Response(JSON.stringify({ error: "Please complete the verification" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const verifyResponse = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: turnstileToken,
          }),
        },
      );

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        console.error("Turnstile verification failed:", verifyData);
        return new Response(JSON.stringify({ error: "Verification failed. Please try again." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Fitness Dashboard <noreply@gabrieleangeletti.com>",
        to: toEmail,
        subject: "New fitness dashboard signup interest",
        html: `
          <h2>Someone is interested in the fitness dashboard!</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p>This user wants a similar dashboard for their own running data.</p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fitness signup error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
