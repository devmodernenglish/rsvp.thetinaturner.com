// src/pages/api/subscribe.ts
import type { APIRoute } from "astro";

export const prerender = false; // Ensures this endpoint runs dynamically on the Worker

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { firstName, lastName, email, country, dobDay, dobMonth, dobYear, marketing } = data;

    const runtimeEnv = (locals as any)?.runtime?.env;

    // Access secrets from Cloudflare env bindings or fallback to process.env
    const apiKey = runtimeEnv?.KLAVIYO_API_KEY || process.env.KLAVIYO_API_KEY;
    const listId = runtimeEnv?.KLAVIYO_LIST_ID || process.env.KLAVIYO_LIST_ID;

    if (!apiKey || !listId) {
      console.log("apikey");
      return new Response(JSON.stringify({ message: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Format Date of Birth (YYYY-MM-DD for Klaviyo profile custom properties)
    const formattedDob =
      dobYear && dobMonth && dobDay
        ? `${dobYear}-${String(dobMonth).padStart(2, "0")}-${String(dobDay).padStart(2, "0")}`
        : null;

    // Klaviyo API v2024-02-15 Payload
    const payload = {
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          custom_source: "rsvp.tinaturner.com",
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email: email,
                  first_name: firstName,
                  last_name: lastName,
                  location: {
                    country: country,
                  },
                  properties: {
                    dob: formattedDob,
                    marketing_consent: Boolean(marketing),
                  },
                },
              },
            ],
          },
          historical_import: false,
        },
        relationships: {
          list: {
            data: {
              type: "list",
              id: listId,
            },
          },
        },
      },
    };

    // Call Klaviyo API v3
    const response = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        revision: "2024-02-15",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Klaviyo API Error:", errorData);
      return new Response(JSON.stringify({ message: "Failed to subscribe to Klaviyo" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Subscribed successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Worker error:", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
