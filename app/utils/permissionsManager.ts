import axiosInstance from "../api/axiosIntance";

// utils/permissionsManager.ts - Client-side permissions handler
export class PermissionsManager {
  private static instance: PermissionsManager;
  private permissions: any[] = [];
  private isInitialized = false;

  static getInstance(): PermissionsManager {
    if (!PermissionsManager.instance) {
      PermissionsManager.instance = new PermissionsManager();
    }
    return PermissionsManager.instance;
  }

  async initializePermissions(authToken: string) {
    if (this.isInitialized) return;

    try {
      // First, try to get from sessionStorage
      const stored = sessionStorage.getItem('user_permissions');
      if (stored) {
        this.permissions = JSON.parse(stored);
        this.isInitialized = true;
        return;
      }

      // If not in storage, fetch from API
      const response = await axiosInstance.get(`auth/roles-permissions`)

      if (response && response.data) {
        const data = response.data;
        this.permissions = data.permissions || [];
        
        // Store in sessionStorage for future use
        sessionStorage.setItem('user_permissions', JSON.stringify(this.permissions));
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize permissions:', error);
      this.permissions = [];
      this.isInitialized = true;
    }
  }

  getPermissions(): any[] {
    return this.permissions;
  }

  hasPermission(action: string): boolean {
    return this.permissions.some(permission => 
      permission.isActive && permission.actions === action
    );
  }

  clearPermissions() {
    this.permissions = [];
    this.isInitialized = false;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('user_permissions');
    }
  }
}