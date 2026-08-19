import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const ADMIN_EMAIL =
  Deno.env.get("ADMIN_EMAIL") ?? "akashmondal1599@gmail.com";

const FROM_EMAIL =
  Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  healthCheck?: boolean;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsonResponse(
  data: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only POST requests
  if (req.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed. Use POST.",
      },
      405,
    );
  }

  try {
    const body = (await req.json()) as ContactPayload;

    // Health check
    if (body.healthCheck) {
      return jsonResponse({
        configured: !!RESEND_API_KEY,
      });
    }

    // Get form values
    const name = body.name?.trim();
    const email = body.email?.trim();
    const subject = body.subject?.trim();
    const message = body.message?.trim();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return jsonResponse(
        {
          error: "All fields are required.",
        },
        400,
      );
    }

    // Validate email
    if (!validateEmail(email)) {
      return jsonResponse(
        {
          error: "Invalid email address.",
        },
        400,
      );
    }

    // Message length
    if (message.length > 5000) {
      return jsonResponse(
        {
          error:
            "Message is too long. Maximum 5000 characters.",
        },
        400,
      );
    }

    // ==========================================
    // SUPABASE CONFIGURATION
    // ==========================================

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl) {
      return jsonResponse(
        {
          error:
            "SUPABASE_URL is not configured.",
        },
        500,
      );
    }

    if (!serviceRoleKey) {
      return jsonResponse(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY is not configured.",
        },
        500,
      );
    }

    // ==========================================
    // SAVE MESSAGE TO SUPABASE
    // ==========================================

    const insertRes = await fetch(
      `${supabaseUrl}/rest/v1/messages`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Prefer": "return=representation",
        },

        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          status: "new",
        }),
      },
    );

    if (!insertRes.ok) {
      const errorText = await insertRes.text();

      console.error(
        "Supabase error:",
        errorText,
      );

      return jsonResponse(
        {
          error: "Failed to save message.",
          detail: errorText,
        },
        500,
      );
    }

    // ==========================================
    // RESEND CONFIGURATION
    // ==========================================

    if (!RESEND_API_KEY) {
      return jsonResponse({
        success: true,
        emailSent: false,
        warning:
          "Message saved, but RESEND_API_KEY is not configured.",
      });
    }

    // ==========================================
    // EMAIL HTML
    // ==========================================

    const emailHtml = `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          background: #0a0a0f;
          color: #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        "
      >

        <div
          style="
            background: linear-gradient(
              135deg,
              #6366f1,
              #ec4899
            );
            padding: 24px;
            text-align: center;
          "
        >
          <h1
            style="
              color: white;
              margin: 0;
              font-size: 20px;
            "
          >
            New Portfolio Message
          </h1>
        </div>

        <div style="padding: 32px;">

          <p>
            <strong>Name:</strong>
            ${escapeHtml(name)}
          </p>

          <p>
            <strong>Email:</strong>
            ${escapeHtml(email)}
          </p>

          <p>
            <strong>Subject:</strong>
            ${escapeHtml(subject)}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <p
            style="
              white-space: pre-wrap;
              line-height: 1.6;
            "
          >
            ${escapeHtml(message)}
          </p>

          <hr
            style="
              border: none;
              border-top: 1px solid #333;
              margin: 24px 0;
            "
          >

          <p
            style="
              font-size: 12px;
              color: #64748b;
            "
          >
            Reply directly to this email to respond to
            ${escapeHtml(name)}.
          </p>

        </div>
      </div>
    `;

    // ==========================================
    // SEND EMAIL USING RESEND
    // ==========================================

    const emailRes = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },

        body: JSON.stringify({
          from: `Portfolio Contact <${FROM_EMAIL}>`,
          to: [ADMIN_EMAIL],
          reply_to: email,
          subject: `Portfolio Contact: ${subject}`,
          html: emailHtml,
        }),
      },
    );

    // ==========================================
    // RESEND ERROR
    // ==========================================

    if (!emailRes.ok) {
      const errorText = await emailRes.text();

      console.error(
        "Resend error:",
        errorText,
      );

      return jsonResponse({
        success: true,
        emailSent: false,
        warning:
          "Message was saved, but email notification failed.",
        detail: errorText,
      });
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    return jsonResponse({
      success: true,
      emailSent: true,
      message:
        "Message sent successfully.",
    });

  } catch (error: unknown) {
    console.error(
      "Function error:",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Internal server error";

    return jsonResponse(
      {
        error: errorMessage,
      },
      500,
    );
  }
});