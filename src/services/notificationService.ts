export interface NotifiableApplication {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: unknown;
}

export interface NotifyResult {
  ok: boolean;
  error?: string;
}

const env = (import.meta.env ?? {}) as Record<string, string | undefined>;

/** Generic webhook first, then the two chat-webhook flavours. */
const webhookUrl = () =>
  env.VITE_APPLICATION_WEBHOOK_URL ||
  env.VITE_DISCORD_WEBHOOK_URL ||
  env.VITE_SLACK_WEBHOOK_URL ||
  "";

/**
 * Fire-and-forget alert that a new application landed. Never throws: a missing
 * webhook or a failing endpoint must not affect the applicant's submission.
 */
export async function notifyNewApplication(
  application: NotifiableApplication
): Promise<NotifyResult> {
  const url = webhookUrl();
  if (!url) return { ok: false, error: "no webhook configured" };

  const name =
    [application?.firstName, application?.lastName].filter(Boolean).join(" ").trim() ||
    "Unknown applicant";
  const email = application?.email || "unknown";
  const timestamp = new Date().toISOString();
  const summary = `New model application — ${name} (${email})`;

  // `text`/`content` satisfy Slack/Discord; the structured fields serve a
  // generic webhook.
  const payload = {
    text: summary,
    content: summary,
    event: "new_application",
    applicant: { id: application?.id ?? null, name, email },
    timestamp,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return { ok: false, error: `webhook responded ${response.status}` };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}