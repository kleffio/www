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

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  if (anyOfPermissions && anyOfPermissions.length > 0) {
    const hasAnyPermission = anyOfPermissions.some((perm) => hasPermission(perm));
    if (!hasAnyPermission) {
      return <>{fallback}</>;
    }
  }

  if (anyOfRoles && anyOfRoles.length > 0) {
    if (!hasAnyRole(anyOfRoles)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
