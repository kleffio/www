import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { usePermissions } from '@features/projects/hooks/usePermissions';
import type { ProjectPermission, CollaboratorRole } from '@features/projects/types/permissions';

interface SecureComponentProps {
  children: ReactNode;
  requiredPermission?: ProjectPermission;
  requiredRole?: CollaboratorRole;
  anyOfPermissions?: ProjectPermission[];
  anyOfRoles?: CollaboratorRole[];
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * SecureComponent - Conditionally renders children based on user permissions
 * 
 * Usage examples:
 * 
 * // Show only to users with MANAGE_BILLING permission
 * <SecureComponent requiredPermission="MANAGE_BILLING">
 *   <Button>View Invoices</Button>
 * </SecureComponent>
 * 
 * // Show only to OWNER role
 * <SecureComponent requiredRole="OWNER">
 *   <Button>Delete Project</Button>
 * </SecureComponent>
 * 
 * // Show if user has any of these permissions
 * <SecureComponent anyOfPermissions={["DEPLOY", "WRITE_PROJECT"]}>
 *   <Button>Deploy</Button>
 * </SecureComponent>
 * 
 * // Show custom fallback when permission is denied
 * <SecureComponent requiredPermission="MANAGE_BILLING" fallback={<p>Access denied</p>}>
 *   <BillingPanel />
 * </SecureComponent>
 */
export function SecureComponent({
  children,
  requiredPermission,
  requiredRole,
  anyOfPermissions,
  anyOfRoles,
  fallback = null,
  loadingFallback = null,
}: SecureComponentProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { hasPermission, hasRole, hasAnyRole, isLoading } = usePermissions(projectId);

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  // Check required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  // Check required role
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check any of permissions
  if (anyOfPermissions && anyOfPermissions.length > 0) {
    const hasAnyPermission = anyOfPermissions.some((perm) => hasPermission(perm));
    if (!hasAnyPermission) {
      return <>{fallback}</>;
    }
  }

  // Check any of roles
  if (anyOfRoles && anyOfRoles.length > 0) {
    if (!hasAnyRole(anyOfRoles)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
