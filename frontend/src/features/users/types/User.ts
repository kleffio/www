export interface UserSettings {
  authentikUid: string;
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
