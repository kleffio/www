import { client } from '@shared/lib/client';

export interface CustomRole {
  id: number;
  projectId: string;
  name: string;
  description?: string;
  permissions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomRoleRequest {
  projectId: string;
  name: string;
  description?: string;
  permissions: string[];
}

export async function createCustomRole(data: CreateCustomRoleRequest): Promise<CustomRole> {
  const { projectId, ...payload } = data;
  const response = await client.post<CustomRole>(`/api/v1/projects/${projectId}/custom-roles`, payload);
  return response.data;
}

export async function getProjectCustomRoles(projectId: string): Promise<CustomRole[]> {
  const response = await client.get<CustomRole[]>(`/api/v1/projects/${projectId}/custom-roles`);
  return response.data;
}

export async function updateCustomRole(roleId: number, data: Partial<CreateCustomRoleRequest>): Promise<CustomRole> {
  const response = await client.put<CustomRole>(`/api/v1/custom-roles/${roleId}`, data);
  return response.data;
}

export async function deleteCustomRole(roleId: number): Promise<void> {
  await client.delete(`/api/v1/custom-roles/${roleId}`);
}
