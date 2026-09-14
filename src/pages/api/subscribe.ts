import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { firstName, lastName, email, country, dobDay, dobMonth, dobYear } = data;

    const runtimeEnv = (locals as any)?.runtime?.env;
    const apiKey = runtimeEnv?.KLAVIYO_API_KEY ?? process.env.KLAVIYO_API_KEY ?? import.meta.env.KLAVIYO_API_KEY;
    const listId = runtimeEnv?.KLAVIYO_LIST_ID ?? process.env.KLAVIYO_LIST_ID ?? import.meta.env.KLAVIYO_LIST_ID;

    if (!apiKey || !listId) {
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

    const formattedDob =
      dobYear && dobMonth && dobDay
        ? `${dobYear}-${String(dobMonth).padStart(2, "0")}-${String(dobDay).padStart(2, "0")}`
        : null;

    const klaviyoHeaders = {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: "2025-01-15",
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // -----------------------------------------------------------------
    // STEP 1: Upsert Profile (Create or Update attributes & custom props)
    // -----------------------------------------------------------------
    const profilePayload = {
      data: {
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
          },
        },
      },
    };

    const profileRes = await fetch("https://a.klaviyo.com/api/profile-import/", {
      method: "POST",
      headers: klaviyoHeaders,
      body: JSON.stringify(profilePayload),
    });

    if (!profileRes.ok) {
      const errorData = await profileRes.json();
      console.error("Klaviyo Profile Import Error:", errorData);
      return new Response(JSON.stringify({ message: "Failed to create or update profile" }), {
        status: profileRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // -----------------------------------------------------------------
    // STEP 2: Subscribe Profile to List & Set Consent
    // -----------------------------------------------------------------
    const subscribePayload = {
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
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: "SUBSCRIBED",
                      },
                    },
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

    const subscribeRes = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
      method: "POST",
      headers: klaviyoHeaders,
      body: JSON.stringify(subscribePayload),
    });

    if (!subscribeRes.ok) {
      const errorData = await subscribeRes.json();
      console.error("Klaviyo Subscription Error:", errorData);
      return new Response(JSON.stringify({ message: "Failed to subscribe email to list" }), {
        status: subscribeRes.status,
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
