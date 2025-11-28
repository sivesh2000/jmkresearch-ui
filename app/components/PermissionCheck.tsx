// components/PermissionCheck.tsx - Updated with SSR handling
import React from 'react';
import { usePermissions } from '@/app/utils/permissions';
import { CircularProgress } from '@mui/material';

interface PermissionCheckProps {
  children: React.ReactNode;
  action?: string;
  actions?: string[];
  domain?: string;
  fallback?: React.ReactNode;
  requireAll?: boolean;
  showLoader?: boolean;
}

export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  children,
  action,
  actions = [],
  domain,
  fallback = null,
  requireAll = false,
  showLoader = true,
}) => {
  const { hasPermission, hasDomainAccess, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  // Show loader while permissions are being fetched
  if (loading) {
    return showLoader ? <CircularProgress size={20} /> : null;
  }

  // Domain check
  if (domain && !action && !actions.length) {
    return hasDomainAccess(domain) ? <>{children}</> : <>{fallback}</>;
  }

  // Multiple actions check
  if (actions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(actions)
      : hasAnyPermission(actions);
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // Single action check
  if (action) {
    return hasPermission(action) ? <>{children}</> : <>{fallback}</>;
  }

  return <>{children}</>;
};