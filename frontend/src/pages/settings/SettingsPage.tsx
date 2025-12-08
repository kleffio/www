import { useState, useEffect } from "react";
import { useUserSettings } from "@features/users/hooks/useUserSettings";
import { updateUserProfile } from "@features/users/api/UpdateUserProfile";
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
  const { settings, isLoading, error: loadError, reload } = useUserSettings();
  
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

  // Update form data when settings load
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
    
    // Validate required fields
    if (!formData.name || !formData.email) {
      setNotification({
        type: "error",
        message: "Name and email are required"
      });
      return;
    }

    // Basic email validation
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
      await updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        theme: formData.theme,
        timezone: formData.timezone || null,
        marketingEmails: formData.marketingEmails
      });
      
      await reload();
      
      setNotification({
        type: "success",
        message: "Profile updated successfully!"
      });
      
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update profile"
      });
    } finally {
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
    <div className="app-container py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile & Settings</h1>
          <p className="mt-2 text-neutral-400">
            Manage your account details and preferences
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
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information Card */}
          <Card>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Profile Information</h2>
              
              <div className="mb-6 flex items-center gap-4">
                <UserAvatar initial={initial} name={formData.name} email={formData.email} size="lg" />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-neutral-200">
                    Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Your full name as it should appear across the platform
                  </p>
                </div>

                <div>
                  <Label htmlFor="email" className="text-neutral-200">
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Primary email for account notifications and communication
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-neutral-200">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Optional contact number for account recovery
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Preferences Card */}
          <Card>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="theme" className="text-neutral-200">
                    Theme
                  </Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value) => setFormData({ ...formData, theme: value })}
                  >
                    <SelectTrigger id="theme" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-neutral-500">
                    Choose your preferred theme
                  </p>
                </div>

                <div>
                  <Label htmlFor="timezone" className="text-neutral-200">
                    Timezone
                  </Label>
                  <Input
                    id="timezone"
                    placeholder="e.g., America/New_York"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Set your timezone for accurate timestamps
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails" className="text-neutral-200">
                      Marketing Emails
                    </Label>
                    <p className="text-sm text-neutral-500">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={formData.marketingEmails}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, marketingEmails: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
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
                setNotification(null);
              }}
              disabled={isSaving}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
