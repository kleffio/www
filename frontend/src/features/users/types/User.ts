export interface UserSettings {
  authentikUid: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  theme: "dark" | "light" | "system" | string;
  timezone: string | null;
  marketingEmails: boolean;
}

export type UserSettingsState = {
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
};
