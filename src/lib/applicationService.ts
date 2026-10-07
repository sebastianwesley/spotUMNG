import type { SupabaseClient, Session, User } from "@supabase/supabase-js";
import { supabase as sharedClient } from "./supabaseClient";

export type ApplicationStatus = "new" | "reviewing" | "accepted" | "declined";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "new",
  "reviewing",
  "accepted",
  "declined",
];

const BUCKET = "applicant-photos";
const PHOTOS_FOLDER = "applications";

// Monotonic suffix so two uploads in the same millisecond still get unique
// object paths (Date.now() alone can collide).
let uploadSequence = 0;

export interface ApplicationInput {
  firstName: string;
  lastName: string;
  email: string;
  age: number | string;
  height: string;
  location: string;
  instagram?: string;
  about?: string;
  headshotUrl?: string;
  fullbodyUrl?: string;
  profileUrl?: string;
  additionalUrls?: string[];
}

export interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  height: string;
  location: string;
  instagram: string | null;
  about: string | null;
  headshot_url: string | null;
  fullbody_url: string | null;
  profile_url: string | null;
  additional_urls: string[] | null;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ServiceError = { message: string };

const toMessage = (error: unknown): ServiceError =>
  error && typeof error === "object" && "message" in error
    ? { message: String((error as { message: unknown }).message) }
    : { message: "Something went wrong. Please try again." };

/** Resolve the injected client; undefined falls back to the shared instance. */
const resolveClient = (client?: SupabaseClient | null): SupabaseClient | null => {
  if (client === undefined) return sharedClient;
  return client ?? null;
};

const missingClient = (): ServiceError => ({
  message: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
});

export async function submitApplication(
  payload: ApplicationInput,
  client?: SupabaseClient | null
): Promise<{ data: { id: string | null }; error: ServiceError | null }> {
  const db = resolveClient(client);
  if (!db) return { data: { id: null }, error: missingClient() };

  // camelCase -> snake_case; blank optional values are omitted entirely.
  const row: Record<string, unknown> = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    age: Number(payload.age),
    height: payload.height,
    location: payload.location,
  };
  if (payload.instagram?.trim()) row.instagram = payload.instagram;
  if (payload.about?.trim()) row.about = payload.about;
  if (payload.headshotUrl) row.headshot_url = payload.headshotUrl;
  if (payload.fullbodyUrl) row.fullbody_url = payload.fullbodyUrl;
  if (payload.profileUrl) row.profile_url = payload.profileUrl;
  if (payload.additionalUrls?.length) row.additional_urls = payload.additionalUrls;

  try {
    // No .select() after insert: the anon role may INSERT but not read rows back
    // (Prefer: return=minimal).
    const { error } = await db.from("model_applications").insert(row);
    return { data: { id: null }, error: error ? toMessage(error) : null };
  } catch (error) {
    return { data: { id: null }, error: toMessage(error) };
  }
}

export async function uploadApplicantPhoto(
  file: File | Blob,
  kind: "headshot" | "fullbody" | "profile" | "additional",
  client?: SupabaseClient | null
): Promise<string> {
  const db = resolveClient(client);
  if (!db) return "";

  // Unique per upload even when the same file is uploaded twice.
  const rawName = (file as File).name || "photo.jpg";
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${PHOTOS_FOLDER}/${kind}-${Date.now()}-${++uploadSequence}-${safeName}`;

  try {
    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) return "";

    // Private bucket: return the storage path, never a public URL.
    return path;
  } catch {
    return "";
  }
}

export async function listApplications(
  client?: SupabaseClient | null
): Promise<{ data: Application[]; error: ServiceError | null }> {
  const db = resolveClient(client);
  if (!db) return { data: [], error: missingClient() };

  try {
    const { data, error } = await db
      .from("model_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { data: [], error: toMessage(error) };
    return { data: (data ?? []) as Application[], error: null };
  } catch (error) {
    return { data: [], error: toMessage(error) };
  }
}

/**
 * Best-effort cleanup for the application flow: removes already-uploaded photo
 * objects when a later step fails so the private bucket never accumulates
 * orphans. Never throws.
 */
export async function deleteApplicantPhotos(
  paths: string[],
  client?: SupabaseClient | null
): Promise<void> {
  if (!paths.length) return;
  const db = resolveClient(client);
  if (!db) return;

  try {
    await db.storage.from(BUCKET).remove(paths);
  } catch {
    // Cleanup is best-effort; the original submit error takes precedence.
  }
}

export async function updateApplicationStatus(
  id: string,
  status: string,
  notes?: string | null,
  client?: SupabaseClient | null
): Promise<{ error: ServiceError | null }> {
  // Client-side enum guard: reject before touching the database.
  if (!APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
    throw new Error(`Invalid application status: ${String(status)}`);
  }

  const db = resolveClient(client);
  if (!db) return { error: missingClient() };

  const patch: Record<string, unknown> = { status };
  if (notes) patch.notes = notes;

  try {
    const { error } = await db.from("model_applications").update(patch).eq("id", id);
    return { error: error ? toMessage(error) : null };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

export async function signInAdmin(
  email: string,
  password: string,
  client?: SupabaseClient | null
): Promise<{
  user: User | null;
  session: Session | null;
  error: ServiceError | null;
}> {
  const db = resolveClient(client);
  if (!db) return { user: null, session: null, error: missingClient() };

  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) return { user: null, session: null, error: toMessage(error) };

    // Only users carrying the admin JWT claim may proceed; the rejected
    // session must not linger in the client.
    const isAdmin = (data?.user as { app_metadata?: { admin?: unknown } } | null | undefined)
      ?.app_metadata?.admin === true;
    if (!isAdmin) {
      await db.auth.signOut();
      return { user: null, session: null, error: { message: "Not authorized as admin" } };
    }

    return { user: data?.user ?? null, session: data?.session ?? null, error: null };
  } catch (error) {
    return { user: null, session: null, error: toMessage(error) };
  }
}

export async function signOutAdmin(
  client?: SupabaseClient | null
): Promise<{ error: ServiceError | null }> {
  const db = resolveClient(client);
  if (!db) return { error: missingClient() };

  try {
    const { error } = await db.auth.signOut();
    return { error: error ? toMessage(error) : null };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

export async function getAdminSession(
  client?: SupabaseClient | null
): Promise<{ session: Session | null; error: ServiceError | null }> {
  const db = resolveClient(client);
  if (!db) return { session: null, error: missingClient() };

  try {
    const { data, error } = await db.auth.getSession();
    const session = data?.session ?? null;

    const isAdmin =
      (session?.user as { app_metadata?: { admin?: unknown } } | null | undefined)?.app_metadata
        ?.admin === true;
    // Claim gate: only a session whose user carries app_metadata.admin === true
    // may be handed out (the old dead tree's authService behaviour). Surface the
    // auth error even when the gate rejects, instead of reporting clean empty.
    if (!isAdmin) return { session: null, error: error ? toMessage(error) : null };

    return { session, error: error ? toMessage(error) : null };
  } catch (error) {
    return { session: null, error: toMessage(error) };
  }
}

export async function changeAdminPassword(
  newPassword: string,
  client?: SupabaseClient | null
): Promise<{ error: ServiceError | null }> {
  const db = resolveClient(client);
  if (!db) return { error: missingClient() };

  try {
    const { error } = await db.auth.updateUser({ password: newPassword });
    return { error: error ? toMessage(error) : null };
  } catch (error) {
    return { error: toMessage(error) };
  }
}
