// Supabase Edge Function: notify-new-application
//
// Sends an email alert when a new model application is submitted. Called from
// the client (src/services/notificationService.ts) and, later, server-side from
// a database hook.
//
// Env vars (set with `supabase secrets set`, never on disk):
//   RESEND_API_KEY    — Resend API key (required to actually send)
//   NOTIFY_FROM_EMAIL — default "SpotlightU <onboarding@resend.dev>". Note: the
//     resend.dev from-address only delivers to the Resend account owner's own
//     email — fine for a first version; verify a domain in Resend for broader
//     delivery.
//   NOTIFY_TO_EMAIL   — default "spotlightmng@outlook.com".
//
// POST body: { firstName, lastName, email, age, height, location }
// Responds { ok: true } (200) or { ok: false, error } with an appropriate
// status. Never throws.
//
// Deno types in this file are intentionally structural (no remote deno.land
// imports) so the file is type-checkable from the Node toolchain too.

interface FunctionRequest extends Request {
  json(): Promise<Record<string, unknown>>;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_DEFAULT = "SpotlightU <onboarding@resend.dev>";
const TO_DEFAULT = "spotlightmng@outlook.com";

type Field = string | number | undefined;

const escapeHtml = (value: Field) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function fieldRow(label: string, value: Field): string {
  return `<tr><td style="padding:4px 12px 4px 0;color:#666">${escapeHtml(label)}</td><td style="padding:4px 0"><strong>${escapeHtml(
    value
  )}</strong></td></tr>`;
}

export function buildEmailHtml(fields: {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: Field;
  height?: Field;
  location?: Field;
}): string {
  const name = [fields.firstName, fields.lastName].filter(Boolean).join(" ").trim() || "Unknown applicant";

  return `<!DOCTYPE html>
<html>
  <body style="font-family:system-ui,-apple-system,sans-serif;color:#222">
    <h2 style="margin:0 0 12px">New model application — ${escapeHtml(name)}</h2>
    <table style="border-collapse:collapse">
      ${fieldRow("Name", name)}
      ${fieldRow("Email", fields.email)}
      ${fieldRow("Age", fields.age)}
      ${fieldRow("Height", fields.height)}
      ${fieldRow("Location", fields.location)}
    </table>
    <p style="margin-top:16px">
      Review it in the <a href="https://spotlightu.vercel.app/admin">SpotlightU admin dashboard</a>.
    </p>
  </body>
</html>`;
}

Deno.serve(async (req: FunctionRequest) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    if (req.method !== "POST") {
      return Response.json({ ok: false, error: "method not allowed" }, { status: 405, headers: CORS_HEADERS });
    }

    const body = await req.json();

    if (!body?.firstName || !body?.email) {
      return Response.json({ ok: false, error: "firstName and email are required" }, { status: 400, headers: CORS_HEADERS });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return Response.json(
        { ok: false, error: "RESEND_API_KEY not configured — run `supabase secrets set RESEND_API_KEY=...`" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const from = Deno.env.get("NOTIFY_FROM_EMAIL") || FROM_DEFAULT;
    const to = Deno.env.get("NOTIFY_TO_EMAIL") || TO_DEFAULT;
    const name = [body.firstName, body.lastName].filter(Boolean).join(" ").trim() || "Unknown applicant";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New model application — ${name}`,
        html: buildEmailHtml({
          firstName: body.firstName as string,
          lastName: body.lastName as string,
          email: body.email as string,
          age: body.age as Field,
          height: body.height as Field,
          location: body.location as Field,
        }),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return Response.json(
        { ok: false, error: `Resend responded ${response.status}: ${detail.slice(0, 300)}` },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    return Response.json({ ok: true }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

/*
 * DEPLOYMENT (user-approved step — run these yourself, from the repo root):
 *
 *   1. Create a free Resend account (resend.com) and grab an API key.
 *      With the default resend.dev from-address, emails only reach the Resend
 *      account owner's email — fine for a first version. To deliver anywhere,
 *      verify a domain in Resend and set NOTIFY_FROM_EMAIL accordingly.
 *
 *   2. Set the secrets (command line only — never write credentials to files):
 *        supabase secrets set RESEND_API_KEY=re_xxxxxxxx NOTIFY_TO_EMAIL=spotlightmng@outlook.com
 *      (or via the Supabase Dashboard → Project Settings → Edge Functions → Secrets)
 *
 *   3. Deploy the function:
 *        supabase functions deploy notify-new-application
 *
 *   4. Test:
 *        curl -X POST '<project-ref>.supabase.co/functions/v1/notify-new-application' \
 *          -H 'Authorization: Bearer <publishable-key>' \
 *          -H 'Content-Type: application/json' \
 *          -d '{"firstName":"Test","email":"you@example.com"}'
 */
