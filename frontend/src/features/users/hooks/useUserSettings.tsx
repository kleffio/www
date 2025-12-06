import { useContext } from "react";

import { UserSettingsContext, type UserSettingsState } from "@features/users/context/UserContext";

export function useUserSettings(): UserSettingsState {
  const ctx = useContext(UserSettingsContext);
  if (!ctx) {
    throw new Error("useUserSettings must be used inside a <UserSettingsProvider>");
  }
  return ctx;
}
