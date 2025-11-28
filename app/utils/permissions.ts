// utils/permissions.ts - Updated to use PermissionsManager
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { PermissionsManager } from "./permissionsManager";

export const usePermissions = () => {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPermissions = async () => {
      if (status === 'loading') {
        return;
      }

      if (status === 'unauthenticated') {
        setPermissions([]);
        setLoading(false);
        PermissionsManager.getInstance().clearPermissions();
        return;
      }

      if (status === 'authenticated' && session?.token) {
        try {
          const manager = PermissionsManager.getInstance();
          await manager.initializePermissions(session.token);
          setPermissions(manager.getPermissions());
        } catch (error) {
          console.error('Error initializing permissions:', error);
          setPermissions([]);
        } finally {
          setLoading(false);
        }
      }
    };

    initPermissions();
  }, [status, session?.token]);

  return {
    permissions,
    loading,
    
    hasPermission: (action: string) => 
      PermissionsManager.getInstance().hasPermission(action),
    
    hasDomainAccess: (domainName: string) => 
      permissions.some(permission => 
        permission.isActive && 
        permission.actions && 
        permission.actions.toLowerCase().startsWith(domainName.toLowerCase() + '.')
      ),
      
    hasAnyPermission: (actions: string[]) =>
      actions.some(action => 
        PermissionsManager.getInstance().hasPermission(action)
      ),
      
    hasAllPermissions: (actions: string[]) =>
      actions.every(action => 
        PermissionsManager.getInstance().hasPermission(action)
      ),
      
    getUserActions: () => 
      permissions
        .filter(p => p.isActive)
        .map(p => p.actions),
  };
};