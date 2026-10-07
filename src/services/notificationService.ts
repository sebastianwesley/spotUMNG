import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

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

const FUNCTION_NAME = "notify-new-application";

/**
 * Fire-and-forget alert that a new application landed. Never throws: a missing
 * Supabase config or a failing Edge Function must not affect the applicant's
 * submission. The email itself is sent by the `notify-new-application` Edge
 * Function (credentials live only in Supabase secrets, not in this bundle).
 */
export async function notifyNewApplication(
  application: NotifiableApplication,
  client: SupabaseClient | null = supabase
): Promise<NotifyResult> {
  if (!client) return { ok: false, error: "supabase not configured" };

  try {
    const { error } = await client.functions.invoke(FUNCTION_NAME, {
      body: {
        firstName: application?.firstName,
        lastName: application?.lastName,
        email: application?.email,
        age: application?.age,
        height: application?.height,
        location: application?.location,
      },
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
