import { useState, useEffect } from "react";
import { useUserSettings } from "@features/users/hooks/useUserSettings";
import { updateUserProfile } from "@features/users/api/UpdateUserProfile";
import { useIdentity } from "@features/auth/hooks/useIdentity";
import { Button } from "@shared/ui/Button";
import { Card } from "@shared/ui/Card";
import { Input } from "@shared/ui/Input";
import { Label } from "@shared/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/ui/Select";
import { Switch } from "@shared/ui/Switch";
import { UserAvatar } from "@shared/ui/UserAvatar";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";

type NotificationType = "success" | "error" | null;

interface Notification {
  type: NotificationType;
  message: string;
}

export function SettingsPage() {
  const { settings, isLoading, error: loadError } = useUserSettings();
  const { auth } = useIdentity();

  const [formData, setFormData] = useState({
    name: settings?.name || "",
    email: settings?.email || "",
    phone: settings?.phone || "",
    theme: settings?.theme || "dark",
    timezone: settings?.timezone || "",
    marketingEmails: settings?.marketingEmails || false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "",
        email: settings.email || "",
        phone: settings.phone || "",
        theme: settings.theme,
        timezone: settings.timezone || "",
        marketingEmails: settings.marketingEmails
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setNotification({
        type: "error",
        message: "Name and email are required"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setNotification({
        type: "error",
        message: "Please enter a valid email address"
      });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      const nameChanged = formData.name !== settings?.name;

      await updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        theme: formData.theme,
        timezone: formData.timezone || null,
        marketingEmails: formData.marketingEmails
      });

      setNotification({
        type: "success",
        message: nameChanged
          ? "Profile updated! Logging you back in with your new username..."
          : "Profile updated successfully!"
      });

      // If username changed, we need to re-login to get a fresh JWT token
      if (nameChanged) {
        setTimeout(async () => {
          // Sign out and redirect to home, which will trigger login
          await auth.removeUser();
          await auth.signinRedirect();
        }, 1500);
      } else {
        // Just reload if only other fields changed
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update profile"
      });
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-neutral-400">Loading profile...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-red-400">Error loading profile: {loadError.message}</div>
      </div>
    );
  }

  const initial = (formData.name || formData.email || "K").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">Profile & Settings</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Manage your account settings and preferences
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
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
        className="space-y-6"
      >
        {/* Profile Information */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <UserAvatar initial={initial} size="lg" />
            <div>
              <h2 className="text-lg font-semibold text-neutral-100">Profile Information</h2>
              <p className="text-sm text-neutral-400">Update your personal details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-200">
                Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                required
                className="border-neutral-700 bg-neutral-900 text-neutral-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-200">
                Email <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                required
                className="border-neutral-700 bg-neutral-900 text-neutral-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-neutral-200">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="border-neutral-700 bg-neutral-900 text-neutral-100"
              />
              <p className="text-xs text-neutral-500">Optional - used for account recovery</p>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-neutral-100">Preferences</h2>
            <p className="text-sm text-neutral-400">Customize your experience</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-neutral-200">
                Theme
              </Label>
              <Select
                value={formData.theme}
                onValueChange={(value) => setFormData({ ...formData, theme: value })}
              >
                <SelectTrigger
                  id="theme"
                  className="border-neutral-700 bg-neutral-900 text-neutral-100"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-neutral-200">
                Timezone
              </Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                placeholder="America/New_York"
                className="border-neutral-700 bg-neutral-900 text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="marketing" className="text-neutral-200">
                  Marketing Emails
                </Label>
                <p className="text-sm text-neutral-400">
                  Receive emails about new features and updates
                </p>
              </div>
              <Switch
                id="marketing"
                checked={formData.marketingEmails}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, marketingEmails: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
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
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
