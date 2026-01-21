import { client } from "@shared/lib/client";

export interface Invitation {
  id: number;
  projectId: string;
  inviterId: string;
  inviteeEmail: string;
  role: "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";
  customRoleId?: number;
  customRoleName?: string;
  status: "PENDING" | "ACCEPTED" | "REFUSED" | "EXPIRED";
  expiresAt: string;
  createdAt: string;
}

export interface CreateInvitationRequest {
  projectId: string;
  inviteeEmail: string;
  role: "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";
  customRoleId?: number;
  permissions?: string[];
}

export async function createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
  const { projectId, ...payload } = data;
  const response = await client.post<Invitation>(
    `/api/v1/projects/${projectId}/invitations`,
    payload
  );
  return response.data;
}

export async function getMyInvitations(): Promise<Invitation[]> {
  const response = await client.get<Invitation[]>("/api/v1/users/me/invitations");
  return response.data;
}

export async function acceptInvitation(id: number): Promise<void> {
  await client.post(`/api/v1/invitations/${id}/accept`);
}

export async function rejectInvitation(id: number): Promise<void> {
  await client.post(`/api/v1/invitations/${id}/reject`);
}

export async function deleteInvitation(id: number): Promise<void> {
  await client.delete(`/api/v1/invitations/${id}`);
}

export async function getProjectInvitations(projectId: string): Promise<Invitation[]> {
  const response = await client.get<Invitation[]>(`/api/v1/projects/${projectId}/invitations`);
  return response.data;
}
