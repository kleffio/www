export type CollaboratorRole = 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';

export type ProjectPermission =
  | 'READ_PROJECT'
  | 'WRITE_PROJECT'
  | 'DEPLOY'
  | 'MANAGE_ENV_VARS'
  | 'VIEW_LOGS'
  | 'VIEW_METRICS'
  | 'MANAGE_COLLABORATORS'
  | 'DELETE_PROJECT'
  | 'MANAGE_BILLING';

export interface Collaborator {
  id: number;
  projectId: string;
  userId: string;
  role: CollaboratorRole;
  customRoleId?: number;
  customRoleName?: string;
  status: string;
  permissions?: ProjectPermission[];
  invitedBy: string;
  invitedAt: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt?: string;
}
