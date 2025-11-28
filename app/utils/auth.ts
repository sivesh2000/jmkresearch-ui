// utils/auth.ts - Custom signOut with permissions cleanup
import { signOut as nextAuthSignOut } from "next-auth/react";
import { PermissionsManager } from "./permissionsManager";

export const signOut = async (options?: any) => {
  // Clear permissions
  PermissionsManager.getInstance().clearPermissions();
  
  // Call NextAuth signOut
  return nextAuthSignOut(options);
};