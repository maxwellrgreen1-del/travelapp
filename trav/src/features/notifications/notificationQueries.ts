import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export type ActorProfileMini = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

/** Shape returned by `fetchInboxNotifications` (subset of columns + joined actor). */
export type InboxNotification = Pick<
  NotificationRow,
  "id" | "recipient_id" | "actor_id" | "type" | "post_id" | "comment_id" | "read_at" | "payload" | "created_at"
> & {
  actor: ActorProfileMini | null;
};

function tidyMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const m = error.message.trim();
    if (m.length) return m;
  }
  return "Could not load notifications.";
}

export async function fetchInboxNotifications(
  client: Client,
  recipientId: string,
): Promise<{ ok: true; items: InboxNotification[] } | { ok: false; message: string }> {
  const { data: rows, error } = await client
    .from("notifications")
    .select("id, recipient_id, actor_id, type, post_id, comment_id, read_at, payload, created_at")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !rows) {
    return { ok: false, message: tidyMessage(error) };
  }

  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter((id): id is string => Boolean(id)))];

  let actorsById: Record<string, ActorProfileMini> = {};
  if (actorIds.length > 0) {
    const { data: profiles, error: profilesError } = await client
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", actorIds);

    if (!profilesError && profiles) {
      actorsById = Object.fromEntries(
        profiles.map((p) => [p.id, p] as const),
      );
    }
  }

  const items: InboxNotification[] = rows.map((row) => ({
    ...row,
    actor: row.actor_id ? actorsById[row.actor_id] ?? null : null,
  }));

  return { ok: true, items };
}

export async function markNotificationRead(
  client: Client,
  params: { recipientId: string; notificationId: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const readAt = new Date().toISOString();
  const { error } = await client
    .from("notifications")
    .update({ read_at: readAt })
    .eq("id", params.notificationId)
    .eq("recipient_id", params.recipientId)
    .is("read_at", null);

  if (error) {
    return { ok: false, message: tidyMessage(error) };
  }
  return { ok: true };
}

export async function markAllNotificationsRead(
  client: Client,
  recipientId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const readAt = new Date().toISOString();
  const { error } = await client
    .from("notifications")
    .update({ read_at: readAt })
    .eq("recipient_id", recipientId)
    .is("read_at", null);

  if (error) {
    return { ok: false, message: tidyMessage(error) };
  }
  return { ok: true };
}
