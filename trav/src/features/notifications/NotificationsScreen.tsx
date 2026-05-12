"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { notificationActionLine } from "@/features/notifications/notificationCopy";
import {
  type InboxNotification,
  fetchInboxNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/notificationQueries";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { createClient } from "@/lib/supabase/client";
import { initialsFromProfile } from "@/lib/userDisplay";
import { cx } from "@/lib/utils";

function actorDisplayLabel(actor: InboxNotification["actor"]): string {
  if (!actor) {
    return "Someone";
  }
  const trimmed = actor.display_name?.trim();
  if (trimmed) {
    return trimmed;
  }
  return `@${actor.username}`;
}

function notificationTargetHref(item: InboxNotification): string | null {
  if (item.type === "follow") {
    if (!item.actor_id) {
      return null;
    }
    return `/profile?visit=${encodeURIComponent(item.actor_id)}`;
  }
  if (item.post_id) {
    return `/post/${encodeURIComponent(item.post_id)}`;
  }
  return null;
}

export function NotificationsScreen() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [supabase] = useState(() => createClient());
  const inboxAliveRef = useRef(true);

  const [items, setItems] = useState<InboxNotification[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [markAllBusy, setMarkAllBusy] = useState(false);

  const unreadCount = useMemo(() => items.filter((row) => row.read_at == null).length, [items]);

  const loadInbox = useCallback(async () => {
    if (!user) {
      return;
    }
    setListLoading(true);
    setListError(null);
    const result = await fetchInboxNotifications(supabase, user.id);
    if (!inboxAliveRef.current) {
      return;
    }
    setListLoading(false);
    if (!result.ok) {
      setListError(result.message);
      return;
    }
    setItems(result.items);
  }, [supabase, user]);

  useEffect(() => {
    inboxAliveRef.current = true;
    return () => {
      inboxAliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }
    const timer = window.setTimeout(() => {
      void loadInbox();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [authLoading, user, loadInbox]);

  const handleMarkOneRead = useCallback(
    async (notificationId: string) => {
      if (!user) {
        return;
      }

      const priorRef = { value: null as string | null };
      setItems((prev) =>
        prev.map((row) => {
          if (row.id !== notificationId) {
            return row;
          }
          if (row.read_at) {
            return row;
          }
          priorRef.value = row.read_at;
          return { ...row, read_at: new Date().toISOString() };
        }),
      );

      const result = await markNotificationRead(supabase, { recipientId: user.id, notificationId });
      if (!result.ok) {
        setListError(result.message);
        setItems((prev) =>
          prev.map((row) => (row.id === notificationId ? { ...row, read_at: priorRef.value } : row)),
        );
      }
    },
    [supabase, user],
  );

  const handleMarkAllRead = useCallback(async () => {
    if (!user || markAllBusy || unreadCount === 0) {
      return;
    }
    const snapshot = items;
    const readAt = new Date().toISOString();
    setMarkAllBusy(true);
    setListError(null);
    setItems((prev) => prev.map((row) => (row.read_at ? row : { ...row, read_at: readAt })));

    const result = await markAllNotificationsRead(supabase, user.id);
    setMarkAllBusy(false);

    if (!result.ok) {
      setItems(snapshot);
      setListError(result.message);
    }
  }, [items, markAllBusy, supabase, unreadCount, user]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <LoadingState message="Opening your inbox…" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-8">
      <PageHeader
        title="Notifications"
        subtitle="Likes, trail chatter, and new followers land here — synced from Supabase."
        trailing={
          unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-primary"
              disabled={markAllBusy || listLoading}
              onClick={() => void handleMarkAllRead()}
            >
              Mark all read
            </Button>
          ) : null
        }
      />

      {listLoading ? <LoadingState message="Fetching your latest cheers…" className="py-12" /> : null}

      {!listLoading && listError ? (
        <Card padding="lg" tone="muted" className="border-red-200/90 bg-red-50/92 text-sm leading-relaxed text-red-900">
          <p>{listError}</p>
          <Button type="button" variant="outlinePrimary" size="sm" className="mt-4" onClick={() => void loadInbox()}>
            Try again
          </Button>
        </Card>
      ) : null}

      {!listLoading && !listError && items.length === 0 ? (
        <EmptyState
          title="You are all caught up"
          description="When someone hearts your trip, leaves a note, or follows your trail, it will appear on this muted panel."
        />
      ) : null}

      {!listLoading && !listError && items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item) => {
            const href = notificationTargetHref(item);
            const isUnread = item.read_at == null;
            const label = actorDisplayLabel(item.actor);
            const initials = item.actor
              ? initialsFromProfile(item.actor.username, item.actor.display_name)
              : "?";
            const action = notificationActionLine(item.type);
            const timeLabel = formatRelativeTime(new Date(item.created_at));

            const inner = (
              <Card
                padding="md"
                className={cx(
                  "transition-colors",
                  isUnread ? "border-primary/35 bg-primary/[0.04] shadow-primary/10" : "border-neutral-200/90",
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    src={item.actor?.avatar_url?.trim() || undefined}
                    alt=""
                    initials={initials}
                    size="sm"
                    className="ring-2 ring-white"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm leading-snug text-neutral-900">
                      <span className="font-semibold">{label}</span>{" "}
                      <span className="font-normal text-neutral-600">{action}</span>
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400">{timeLabel}</p>
                  </div>
                  {isUnread ? (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary shadow-sm shadow-primary/30" aria-hidden />
                  ) : null}
                </div>
              </Card>
            );

            if (href) {
              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    className="block outline-none ring-primary/25 focus-visible:ring-4"
                    onClick={() => {
                      if (isUnread) {
                        void handleMarkOneRead(item.id);
                      }
                    }}
                  >
                    {inner}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <div>{inner}</div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
