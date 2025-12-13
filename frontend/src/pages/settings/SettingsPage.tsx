import { useEffect, useState } from "react";
import { Save, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

import { updateUserProfile } from "@features/users/api/UpdateUserProfile";
import { getMyAuditLogs } from "@features/users/api/getMyAuditLogs";
import { useUser } from "@features/users/hooks/useUser";

import { Button } from "@shared/ui/Button";
import { Card } from "@shared/ui/Card";
import { Input } from "@shared/ui/Input";
import { Label } from "@shared/ui/Label";
import { UserAvatar } from "@shared/ui/UserAvatar";
import { Skeleton } from "@shared/ui/Skeleton";

import type { AuditLog, AuditLogPage } from "@features/users/types/Audit";

type NotificationType = "success" | "error" | null;

interface Notification {
  type: NotificationType;
  message: string;
}

const PAGE_SIZE = 10;

interface AuditPaginationProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

function AuditPagination({
  currentPage,
  totalPages,
  isLoading,
  onPageChange
}: AuditPaginationProps) {
  if (totalPages <= 1) return null;

  const handleClick = (page: number) => {
    if (page === currentPage || isLoading) return;
    onPageChange(page);
  };

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <div className="mt-4 border-t border-neutral-800 pt-4">
      <div className="flex justify-center">
        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-neutral-800/80 bg-neutral-950/80 px-1.5 py-1 shadow-inner shadow-black/40">
          <button
            type="button"
            disabled={isLoading || currentPage === 1}
            onClick={() => handleClick(currentPage - 1)}
            className={
              "flex h-7 w-7 items-center justify-center rounded-full border border-transparent transition " +
              (isLoading || currentPage === 1
                ? "cursor-not-allowed text-neutral-300 opacity-40"
                : "cursor-pointer text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900/80 hover:text-neutral-50")
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pages.map((pageNumber) => {
            const isActive = pageNumber === currentPage;
            return (
              <button
                key={pageNumber}
                type="button"
                disabled={isLoading}
                onClick={() => handleClick(pageNumber)}
                className={
                  "inline-flex h-7 min-w-7 cursor-pointer items-center justify-center rounded-full px-2 text-[11px] transition " +
                  (isActive
                    ? "bg-gradient-kleff text-neutral-950 shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
                    : "border border-transparent text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900/80 hover:text-neutral-50 disabled:text-neutral-500")
                }
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            type="button"
            disabled={isLoading || currentPage === totalPages}
            onClick={() => handleClick(currentPage + 1)}
            className={
              "flex h-7 w-7 items-center justify-center rounded-full border border-transparent transition " +
              (isLoading || currentPage === totalPages
                ? "cursor-not-allowed text-neutral-300 opacity-40"
                : "cursor-pointer text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900/80 hover:text-neutral-50")
            }
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { avatarUrl: oidcAvatar, user, isLoading, error: loadError, reload } = useUser();

  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    email: "",
    avatarUrl: "",
    bio: ""
  });

  const isDirty =
    formData.username !== user?.username ||
    formData.displayName !== user?.displayName ||
    (formData.avatarUrl || "") !== (user?.avatarUrl || "") ||
    (formData.bio || "") !== (user?.bio || "");

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(auditTotal / PAGE_SIZE));

  const loadAuditPage = async (page: number) => {
    if (!user) return;

    setAuditLoading(true);
    setAuditError(null);

    try {
      const offset = (page - 1) * PAGE_SIZE;
      const { items, total }: AuditLogPage = await getMyAuditLogs(PAGE_SIZE, offset);

      setAuditLogs(items ?? []);
      setAuditTotal(total ?? 0);
      setAuditPage(page);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    setFormData({
      username: user.username ?? "",
      displayName: user.displayName ?? "",
      email: user.email ?? "",
      avatarUrl: user.avatarUrl ?? "",
      bio: user.bio ?? ""
    });

    setAuditLogs([]);
    setAuditTotal(0);
    setAuditPage(1);

    void loadAuditPage(1);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.username.trim() || !formData.displayName.trim()) {
      setNotification({
        type: "error",
        message: "Username and display name are required."
      });
      return;
    }

    const updatePayload: {
      username?: string;
      displayName?: string;
      avatarUrl?: string | null;
      bio?: string | null;
    } = {};

    if (formData.username.trim() !== user.username) {
      updatePayload.username = formData.username.trim();
    }
    if (formData.displayName.trim() !== user.displayName) {
      updatePayload.displayName = formData.displayName.trim();
    }
    if ((formData.avatarUrl || null) !== (user.avatarUrl ?? null)) {
      updatePayload.avatarUrl = formData.avatarUrl || null;
    }
    if ((formData.bio || null) !== (user.bio ?? null)) {
      updatePayload.bio = formData.bio || null;
    }

    if (Object.keys(updatePayload).length === 0) {
      setNotification({
        type: "success",
        message: "No changes to save."
      });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      await updateUserProfile(updatePayload);
      await reload();

      setNotification({
        type: "success",
        message: "Profile updated successfully."
      });

      void loadAuditPage(auditPage);
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update profile."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const createdAtDate = user?.createdAt ? new Date(user.createdAt) : null;
  const createdAtLabel = createdAtDate
    ? createdAtDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "Unknown";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div className="space-y-3">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Card className="border-neutral-800/80 bg-neutral-950/70 p-6 pb-10 shadow-lg shadow-black/40">
          <div className="mb-6 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>

        <Card className="border-neutral-800/80 bg-neutral-950/70 p-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-56" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 10 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-10 w-full rounded-md border border-neutral-800 bg-neutral-900/70"
              />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-red-400">
          Error loading profile: {loadError?.message ?? "Unknown error"}
        </div>
      </div>
    );
  }

  const initial = (formData.displayName || formData.email || "K").charAt(0).toUpperCase();
  const displayAvatar = formData.avatarUrl || oidcAvatar || undefined;

  const showAuditSkeleton = auditLoading;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
            Account settings
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Manage your profile details and review your account activity.
          </p>
        </div>
      </div>

      {notification && (
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="space-y-6">
        <Card className="border-neutral-800/80 bg-neutral-950/70 px-6 py-6 pb-12 shadow-lg shadow-black/40">
          <div className="mb-6 flex items-center gap-4">
            <UserAvatar initial={initial} size="lg" src={displayAvatar} />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-neutral-50">
                {formData.displayName || "Your profile"}
              </h2>
              <p className="text-xs text-neutral-400">
                These details appear in dashboards, deployments and activity views.
              </p>
              <div className="text-xs text-neutral-500">{formData.email}</div>
              <div className="text-[11px] text-neutral-500">
                Member since <span className="text-neutral-300">{createdAtLabel}</span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}
            className="grid gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-medium text-neutral-400 uppercase">
                Username <span className="text-red-400">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="your-username"
                className="focus:border-kleff-gold focus:ring-kleff-gold border-neutral-800 bg-neutral-900/80 text-neutral-50"
              />
              <p className="text-xs text-neutral-500">
                Used in URLs and mentions. Only lowercase letters, numbers, dashes and underscores.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="displayName"
                className="text-xs font-medium tracking-wide text-neutral-400 uppercase"
              >
                Display name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayName: e.target.value
                  }))
                }
                placeholder="How you appear in the app"
                className="focus:border-kleff-gold focus:ring-kleff-gold border-neutral-800 bg-neutral-900/80 text-neutral-50"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium tracking-wide text-neutral-400 uppercase"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="border-neutral-900 bg-neutral-950/80 text-neutral-500"
              />
              <p className="text-xs text-neutral-500">
                Email is managed by Authentik and cannot be changed here.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="avatarUrl"
                className="text-xs font-medium tracking-wide text-neutral-400 uppercase"
              >
                Avatar URL
              </Label>
              <Input
                id="avatarUrl"
                value={formData.avatarUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    avatarUrl: e.target.value
                  }))
                }
                placeholder="https://example.com/avatar.png"
                className="focus:border-kleff-gold focus:ring-kleff-gold border-neutral-800 bg-neutral-900/80 text-neutral-50"
              />
              <p className="text-xs text-neutral-500">
                Optional. In the future this can be replaced with uploads.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="bio"
                className="text-xs font-medium tracking-wide text-neutral-400 uppercase"
              >
                Bio
              </Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bio: e.target.value
                  }))
                }
                maxLength={512}
                className="focus:border-kleff-gold focus:ring-kleff-gold max-h-48 min-h-24 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-50 ring-0 transition outline-none focus:ring-1"
                placeholder="Tell people a bit about yourself."
              />

              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>Up to 512 characters.</span>
                <span>
                  {formData.bio.length}
                  /512
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSaving || !isDirty}
                className="bg-gradient-kleff mt-1 inline-flex w-full items-center gap-2 rounded-full px-5 py-3 text-base shadow-md shadow-black/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="border-neutral-800/80 bg-neutral-950/70 p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-neutral-50">Account activity</h2>
              <p className="mt-1 text-xs text-neutral-400">
                Security-relevant events recorded by the user-service.
              </p>
            </div>
            <span className="hidden text-[11px] text-neutral-500 sm:inline">
              Page {auditPage} of {totalPages}
            </span>
          </div>

          {/* Skeleton for audits on initial load + page transitions */}
          {showAuditSkeleton && (
            <div className="mt-2 space-y-2">
              {Array.from({ length: 10 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-10 w-full rounded-md border border-neutral-800 bg-neutral-900/70"
                />
              ))}
            </div>
          )}

          {!showAuditSkeleton && auditError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {auditError}
            </div>
          )}

          {!showAuditSkeleton && !auditError && auditLogs.length === 0 && (
            <div className="py-4 text-sm text-neutral-500">No activity recorded yet.</div>
          )}

          {!showAuditSkeleton && !auditError && auditLogs.length > 0 && (
            <>
              <div className="mt-2 space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1 rounded-md border border-neutral-800 bg-neutral-950/90 p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-medium text-neutral-50">{log.action}</div>
                      <div className="mt-0.5 text-[11px] text-neutral-500">
                        IP: {log.ipAddress ?? "unknown"} · Agent:{" "}
                        {log.userAgent?.slice(0, 60) ?? "unknown"}
                      </div>
                    </div>
                    <div className="text-[11px] text-neutral-500 sm:text-right">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <AuditPagination
                currentPage={auditPage}
                totalPages={totalPages}
                isLoading={auditLoading}
                onPageChange={(page) => void loadAuditPage(page)}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
