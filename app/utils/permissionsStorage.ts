// utils/permissionsStorage.ts
export class PermissionsStorage {
  private static STORAGE_KEY = 'user_permissions';

  static setPermissions(permissions: any[]) {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(permissions));
      } catch (error) {
        console.error('Failed to store permissions:', error);
      }
    }
  }

  static getPermissions(): any[] {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Failed to retrieve permissions:', error);
        return [];
      }
    }
    return [];
  }

  static clearPermissions() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  static hasPermissions(): boolean {
    return this.getPermissions().length > 0;
  }
}