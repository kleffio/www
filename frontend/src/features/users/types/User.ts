export interface UserSettings {
  id: string;
  email: string;
  emailVerified: boolean;

  handle: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;

  createdAt: string;
  updatedAt: string;
}

export type UserSettingsState = {
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
};
