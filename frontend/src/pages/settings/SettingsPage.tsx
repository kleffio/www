import { useEffect, useState } from "react";
import { useUserSettings } from "@features/users/hooks/useUserSettings";
import { updateUserProfile } from "@features/users/api/UpdateUserProfile";
import { getMyAuditLogs, type AuditLog } from "@features/users/api/getMyAuditLogs";
import { useIdentity } from "@features/auth/hooks/useIdentity";

import { Button } from "@shared/ui/Button";
import { Card } from "@shared/ui/Card";
import { Input } from "@shared/ui/Input";
import { Label } from "@shared/ui/Label";
import { UserAvatar } from "@shared/ui/UserAvatar";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";

type NotificationType = "success" | "error" | null;

interface Notification {
  type: NotificationType;
  message: string;
}

const PAGE_SIZE = 10;

export function SettingsPage() {
  const { settings, isLoading, error: loadError } = useUserSettings();
  const { email: idpEmail, picture } = useIdentity();

  const [formData, setFormData] = useState({
    handle: "",
    displayName: "",
    email: "",
    avatarUrl: "",
    bio: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditLoadingMore, setAuditLoadingMore] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditOffset, setAuditOffset] = useState(0);
  const [auditHasMore, setAuditHasMore] = useState(false);

  const loadAuditPage = async (offset: number, append: boolean) => {
    if (!settings) return;

    if (append) setAuditLoadingMore(true);
    else setAuditLoading(true);

    setAuditError(null);

    try {
      const logs = await getMyAuditLogs(PAGE_SIZE, offset);

      setAuditLogs((prev) => (append ? [...prev, ...logs] : logs));

      const newOffset = offset + logs.length;
      setAuditOffset(newOffset);
      setAuditHasMore(logs.length === PAGE_SIZE);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setAuditLoading(false);
      setAuditLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!settings) return;

    setFormData({
      handle: settings.handle ?? "",
      displayName: settings.displayName ?? "",
      email: settings.email ?? idpEmail ?? "",
      avatarUrl: settings.avatarUrl ?? "",
      bio: settings.bio ?? ""
    });

    setAuditLogs([]);
    setAuditOffset(0);
    setAuditHasMore(false);

    void loadAuditPage(0, false);
  }, [settings, idpEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (!formData.handle.trim() || !formData.displayName.trim()) {
      setNotification({
        type: "error",
        message: "Handle and display name are required."
      });
      return;
    }

    const updatePayload: {
      handle?: string;
      displayName?: string;
      avatarUrl?: string | null;
      bio?: string | null;
    } = {};

    if (formData.handle.trim() !== settings.handle) {
      updatePayload.handle = formData.handle.trim();
    }
    if (formData.displayName.trim() !== settings.displayName) {
      updatePayload.displayName = formData.displayName.trim();
    }
    if ((formData.avatarUrl || null) !== (settings.avatarUrl ?? null)) {
      updatePayload.avatarUrl = formData.avatarUrl || null;
    }
    if ((formData.bio || null) !== (settings.bio ?? null)) {
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
      const updated = await updateUserProfile(updatePayload);

      setFormData((prev) => ({
        ...prev,
        handle: updated.handle,
        displayName: updated.displayName,
        avatarUrl: updated.avatarUrl ?? "",
        bio: updated.bio ?? ""
      }));

      setNotification({
        type: "success",
        message: "Profile updated successfully."
      });

      // after a profile update, reload first page of logs
      void loadAuditPage(0, false);
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update profile."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-neutral-400">Loading profile…</div>
      </div>
    );
  }

  if (loadError || !settings) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-red-400">
          Error loading profile: {loadError?.message ?? "Unknown error"}
        </div>
      </div>
    );
  }

  const initial = (formData.displayName || formData.email || "K").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">Account</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Manage your profile and review recent account activity.
        </p>
      </div>

      {notification && (
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 ${
            notification.type === "success"
              ? "border-green-500/20 bg-green-500/10 text-green-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}

      {/* Profile card */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <UserAvatar
            initial={initial}
            size="lg"
            src={formData.avatarUrl || (picture as string | undefined)}
          />
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">Profile</h2>
            <p className="text-sm text-neutral-400">
              These details are visible wherever your profile appears.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
              e.preventDefault();
            }
          }}
          className="space-y-4"
        >
          {/* Handle */}
          <div className="space-y-2">
            <Label htmlFor="handle" className="text-neutral-200">
              Handle <span className="text-red-400">*</span>
            </Label>
            <Input
              id="handle"
              value={formData.handle}
              onChange={(e) => setFormData((prev) => ({ ...prev, handle: e.target.value }))}
              placeholder="your-handle"
              className="border-neutral-700 bg-neutral-900 text-neutral-100"
            />
            <p className="text-xs text-neutral-500">
              Used in URLs and mentions. Only letters, numbers, dashes and underscores.
            </p>
          </div>

          {/* Display name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-neutral-200">
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
              className="border-neutral-700 bg-neutral-900 text-neutral-100"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="border-neutral-800 bg-neutral-900/70 text-neutral-400"
            />
            <p className="text-xs text-neutral-500">
              Email is managed by Authentik and cannot be changed here.
            </p>
          </div>

          {/* Avatar URL */}
          <div className="space-y-2">
            <Label htmlFor="avatarUrl" className="text-neutral-200">
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
              className="border-neutral-700 bg-neutral-900 text-neutral-100"
            />
            <p className="text-xs text-neutral-500">
              Optional. In the future this can be replaced with uploads.
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-neutral-200">
              Bio
            </Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              className="focus:border-kleff-gold focus:ring-kleff-gold min-h-24 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-1"
              placeholder="Tell people a bit about yourself."
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              style={{
                backgroundColor: isSaving ? "rgb(220, 163, 20)" : "rgb(245, 181, 23)",
                color: "#000000"
              }}
              className="px-6 py-2 font-medium transition-opacity hover:opacity-90"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Audit logs card with paging */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">Recent account activity</h2>
            <p className="text-sm text-neutral-400">
              Security-relevant events from your user-service audit log.
            </p>
          </div>
        </div>

        {auditLoading && <div className="py-4 text-sm text-neutral-400">Loading audit logs…</div>}

        {auditError && !auditLoading && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {auditError}
          </div>
        )}

        {!auditLoading && !auditError && auditLogs.length === 0 && (
          <div className="py-4 text-sm text-neutral-500">No activity recorded yet.</div>
        )}

        {!auditLoading && !auditError && auditLogs.length > 0 && (
          <>
            <div className="mt-2 space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-1 rounded-md border border-neutral-800 bg-neutral-950/60 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium text-neutral-100">{log.action}</div>
                    <div className="text-xs text-neutral-500">
                      IP: {log.ipAddress ?? "unknown"} · Agent:{" "}
                      {log.userAgent?.slice(0, 60) ?? "unknown"}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500 sm:text-right">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {auditHasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void loadAuditPage(auditOffset, true)}
                  disabled={auditLoadingMore}
                  className="border-neutral-700 bg-neutral-950 text-xs text-neutral-200 hover:bg-neutral-900"
                >
                  {auditLoadingMore ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
