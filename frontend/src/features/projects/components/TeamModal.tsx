import { useState, useEffect, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/Table';
import { Badge } from '@shared/ui/Badge';
import { SoftPanel } from '@shared/ui/SoftPanel';
import { UserPlus, Trash2, X, Mail, Edit2, Users, CheckSquare, Square, Lock, Plus } from 'lucide-react';
import { getProjectCollaborators, deleteCollaborator, updateCollaboratorRole } from '../api/collaborators';
import { createInvitation, getProjectInvitations, deleteInvitation, type Invitation } from '../api/invitations';
import { getProjectCustomRoles, createCustomRole, type CustomRole } from '../api/customRoles';

interface Collaborator {
  id: number;
  userId: string;
  projectId: string;
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  customRoleId?: number;
  customRoleName?: string;
  collaboratorStatus: string;
  invitedBy: string;
  invitedAt: string;
  acceptedAt?: string;
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  userRole: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
}

const ROLE_DESCRIPTIONS = {
  OWNER: 'Full access including project deletion',
  ADMIN: 'Manage team, deploy, and configure',
  DEVELOPER: 'Deploy containers and manage env vars',
  VIEWER: 'Read-only access',
};

const AVAILABLE_PERMISSIONS = [
  { value: 'READ_PROJECT', label: 'Read Project', description: 'View project details' },
  { value: 'WRITE_PROJECT', label: 'Write Project', description: 'Edit project settings' },
  { value: 'DEPLOY', label: 'Deploy', description: 'Deploy containers' },
  { value: 'MANAGE_ENV_VARS', label: 'Manage Env Vars', description: 'Edit environment variables' },
  { value: 'VIEW_LOGS', label: 'View Logs', description: 'View container logs' },
  { value: 'VIEW_METRICS', label: 'View Metrics', description: 'View project metrics' },
  { value: 'MANAGE_COLLABORATORS', label: 'Manage Team', description: 'Invite and remove collaborators' },
  { value: 'DELETE_PROJECT', label: 'Delete Project', description: 'Delete the project' },
  { value: 'MANAGE_BILLING', label: 'Manage Billing', description: 'View and manage billing' },
];

// Role-based default permissions (like AWS IAM roles)
const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  VIEWER: ['READ_PROJECT', 'VIEW_LOGS', 'VIEW_METRICS'],
  DEVELOPER: ['READ_PROJECT', 'VIEW_LOGS', 'VIEW_METRICS', 'DEPLOY', 'MANAGE_ENV_VARS'],
  ADMIN: ['READ_PROJECT', 'WRITE_PROJECT', 'DEPLOY', 'MANAGE_ENV_VARS', 'VIEW_LOGS', 'VIEW_METRICS', 'MANAGE_COLLABORATORS', 'MANAGE_BILLING'],
  OWNER: ['READ_PROJECT', 'WRITE_PROJECT', 'DEPLOY', 'MANAGE_ENV_VARS', 'VIEW_LOGS', 'VIEW_METRICS', 'MANAGE_COLLABORATORS', 'DELETE_PROJECT', 'MANAGE_BILLING'],
};

export function TeamModal({ isOpen, onClose, projectId, userRole }: TeamModalProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRoleType, setSelectedRoleType] = useState<'builtin' | 'custom'>('builtin');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'DEVELOPER' | 'VIEWER'>('DEVELOPER');
  const [selectedCustomRoleId, setSelectedCustomRoleId] = useState<number | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<'ADMIN' | 'DEVELOPER' | 'VIEWER'>('DEVELOPER');

  const canManageTeam = userRole === 'OWNER' || userRole === 'ADMIN';
  const canViewInvitations = userRole === 'OWNER' || userRole === 'ADMIN';

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const data = await getProjectCollaborators(projectId);
      setCollaborators(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    if (!canViewInvitations) return;
    try {
      const data = await getProjectInvitations(projectId);
      setInvitations(data);
    } catch (err: any) {
      console.error('Failed to load invitations:', err);
    }
  };

  const loadCustomRoles = async () => {
    try {
      const data = await getProjectCustomRoles(projectId);
      setCustomRoles(data);
    } catch (err: any) {
      console.error('Failed to load custom roles:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
      loadInvitations();
      loadCustomRoles();
    }
  }, [isOpen, projectId]);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail) {
      setError('Please enter an email address');
      return;
    }

    try {
      setInviting(true);
      setError(null);
      
      await createInvitation({
        projectId,
        inviteeEmail: inviteEmail,
        role: selectedRoleType === 'builtin' ? inviteRole : 'VIEWER', 
        customRoleId: selectedRoleType === 'custom' ? selectedCustomRoleId! : undefined,
      });
      
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setSelectedRoleType('builtin');
      setInviteRole('DEVELOPER');
      setSelectedCustomRoleId(null);
      await loadCollaborators();
      await loadInvitations();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleCreateRole = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newRoleName || newRolePermissions.length === 0) {
      setError('Please provide a name and select at least one permission');
      return;
    }

    try {
      setCreatingRole(true);
      setError(null);
      
      await createCustomRole({
        projectId,
        name: newRoleName,
        description: newRoleDescription,
        permissions: newRolePermissions,
      });
      
      setSuccess(`Custom role "${newRoleName}" created`);
      setIsCreateRoleModalOpen(false);
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRolePermissions([]);
      await loadCustomRoles();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create custom role');
    } finally {
      setCreatingRole(false);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await deleteCollaborator(projectId, userId);
      setSuccess('Collaborator removed');
      await loadCollaborators();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove collaborator');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteInvitation = async (invitationId: number) => {
    try {
      await deleteInvitation(invitationId);
      setSuccess('Invitation deleted');
      await loadInvitations();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete invitation');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateRole = async (userId: string) => {
    try {
      await updateCollaboratorRole(projectId, userId, editingRole);
      setSuccess('Role updated successfully');
      setEditingUserId(null);
      await loadCollaborators();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role');
      setTimeout(() => setError(null), 3000);
    }
  };

  const startEditing = (collaborator: Collaborator) => {
    setEditingUserId(collaborator.userId);
    setEditingRole(collaborator.role as 'ADMIN' | 'DEVELOPER' | 'VIEWER');
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-50">Team Management</h2>
                <p className="text-sm text-neutral-400">
                  {collaborators.length} member{collaborators.length !== 1 ? 's' : ''}
                  {canViewInvitations && invitations.length > 0 && ` • ${invitations.length} pending invitation${invitations.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canManageTeam && (
                <Button 
                  size="sm" 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="rounded-full px-4 py-2 text-sm bg-gradient-kleff text-black font-semibold"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-6 w-6 text-neutral-400 hover:text-neutral-200" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 space-y-6">
            {success && (
              <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Team Members Section */}
            <div>
              <h3 className="text-md font-semibold text-neutral-50 mb-3">Team Members</h3>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/5">
                      <TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      {canManageTeam && <TableHead className="w-[120px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={canManageTeam ? 5 : 4} className="text-center text-neutral-400 py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : collaborators.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={canManageTeam ? 5 : 4} className="text-center text-neutral-400 py-8">
                          No team members yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      collaborators.map((collaborator) => (
                        <TableRow key={collaborator.id} className="hover:bg-white/5">
                          <TableCell className="font-mono text-sm text-neutral-300">
                            {collaborator.userId.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {editingUserId === collaborator.userId && canManageTeam ? (
                              <div className="flex items-center gap-2">
                                <Select
                                  value={editingRole}
                                  onValueChange={(value) => setEditingRole(value as 'ADMIN' | 'DEVELOPER' | 'VIEWER')}
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="DEVELOPER">Developer</SelectItem>
                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateRole(collaborator.userId)}
                                  className="h-8 px-2 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400"
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingUserId(null)}
                                  className="h-8 px-2 text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Badge 
                                variant={
                                  collaborator.role === 'OWNER' ? 'info' :
                                  collaborator.role === 'ADMIN' ? 'info' :
                                  collaborator.role === 'DEVELOPER' ? 'success' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {collaborator.customRoleName || collaborator.role}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={collaborator.acceptedAt ? 'success' : 'warning'} className="text-xs">
                              {collaborator.collaboratorStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-neutral-400">
                            {collaborator.acceptedAt
                              ? new Date(collaborator.acceptedAt).toLocaleDateString()
                              : 'Pending'}
                          </TableCell>
                          {canManageTeam && (
                            <TableCell>
                              {collaborator.role !== 'OWNER' && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditing(collaborator)}
                                    className="p-2"
                                    title="Edit role"
                                  >
                                    <Edit2 className="h-4 w-4 text-blue-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(collaborator.userId)}
                                    className="p-2"
                                    title="Remove collaborator"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pending Invitations Section - Only for Admins/Owners */}
            {canViewInvitations && (
              <div>
                <h3 className="text-md font-semibold text-neutral-50 mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Pending Invitations
                </h3>
                <div className="rounded-lg border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/5">
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Sent</TableHead>
                        {canManageTeam && <TableHead className="w-[100px]">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={canManageTeam ? 4 : 3} className="text-center text-neutral-400 py-8">
                            <div className="flex flex-col items-center gap-1">
                              <Mail className="h-8 w-8 text-neutral-600 mb-2" />
                              <p className="text-sm">No pending invitations</p>
                              <p className="text-xs text-neutral-500">Invited users will appear here</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        invitations.map((invitation) => (
                          <TableRow key={invitation.id} className="hover:bg-white/5">
                            <TableCell className="font-mono text-sm text-neutral-300">
                              {invitation.inviteeEmail}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  invitation.role === 'ADMIN' ? 'info' :
                                  invitation.role === 'DEVELOPER' ? 'success' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {invitation.customRoleName || invitation.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-neutral-400">
                              {new Date(invitation.createdAt).toLocaleDateString()}
                            </TableCell>
                            {canManageTeam && (
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteInvitation(invitation.id)}
                                  className="p-2"
                                  title="Delete invitation"
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsInviteModalOpen(false)}
        >
          <div 
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <SoftPanel>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-50">Invite Team Member</h3>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-neutral-400 mb-6">
                Send an invitation to collaborate on this project
              </p>

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-neutral-200">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-neutral-200">
                    Role
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select
                        value={selectedRoleType === 'builtin' ? inviteRole : `custom-${selectedCustomRoleId}`}
                        onValueChange={(value) => {
                          if (value.startsWith('custom-')) {
                            setSelectedRoleType('custom');
                            setSelectedCustomRoleId(Number(value.replace('custom-', '')));
                          } else {
                            setSelectedRoleType('builtin');
                            setInviteRole(value as 'ADMIN' | 'DEVELOPER' | 'VIEWER');
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1.5 text-xs font-semibold text-neutral-400">Built-in Roles</div>
                          <SelectItem value="ADMIN">
                            Admin - {ROLE_DESCRIPTIONS.ADMIN}
                          </SelectItem>
                          <SelectItem value="DEVELOPER">
                            Developer - {ROLE_DESCRIPTIONS.DEVELOPER}
                          </SelectItem>
                          <SelectItem value="VIEWER">
                            Viewer - {ROLE_DESCRIPTIONS.VIEWER}
                          </SelectItem>
                          {customRoles.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-neutral-400 border-t border-white/10 mt-2">Custom Roles</div>
                              {customRoles.map((role) => (
                                <SelectItem key={role.id} value={`custom-${role.id}`}>
                                  {role.name}{role.description && ` - ${role.description}`}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreateRoleModalOpen(true)}
                      className="px-3"
                      title="Create custom role"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Display Selected Role Permissions */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-200 flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    {selectedRoleType === 'builtin' ? `${inviteRole} Permissions` : `${customRoles.find(r => r.id === selectedCustomRoleId)?.name || 'Custom Role'} Permissions`}
                  </Label>
                  <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex flex-wrap gap-2">
                      {(selectedRoleType === 'builtin' 
                        ? ROLE_DEFAULT_PERMISSIONS[inviteRole] 
                        : customRoles.find(r => r.id === selectedCustomRoleId)?.permissions || []
                      ).map((permission) => {
                        const perm = AVAILABLE_PERMISSIONS.find(p => p.value === permission);
                        return perm ? (
                          <Badge key={permission} variant="info" className="text-xs">
                            {perm.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={inviting}
                    className="flex-1 rounded-full bg-gradient-kleff text-black font-semibold"
                  >
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </form>
            </SoftPanel>
          </div>
        </div>,
        document.body
      )}

      {/* Create Custom Role Modal */}
      {isCreateRoleModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsCreateRoleModalOpen(false)}
        >
          <div 
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <SoftPanel>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-50">Create Custom Role</h3>
                <button
                  onClick={() => setIsCreateRoleModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-neutral-400 mb-6">
                Define a custom role with specific permissions for this project
              </p>

              <form onSubmit={handleCreateRole} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName" className="text-sm font-medium text-neutral-200">
                    Role Name
                  </Label>
                  <Input
                    id="roleName"
                    type="text"
                    placeholder="e.g., QA Engineer, Security Auditor"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleDescription" className="text-sm font-medium text-neutral-200">
                    Description (Optional)
                  </Label>
                  <textarea
                    id="roleDescription"
                    placeholder="Brief description of this role's responsibilities"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-200">
                    Permissions
                  </Label>
                  <p className="text-xs text-neutral-500 mb-3">
                    Select the permissions this role should have
                  </p>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-3 rounded-lg border border-white/10 bg-white/5">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <button
                        key={permission.value}
                        type="button"
                        onClick={() => {
                          setNewRolePermissions(prev =>
                            prev.includes(permission.value)
                              ? prev.filter(p => p !== permission.value)
                              : [...prev, permission.value]
                          );
                        }}
                        className="flex items-start gap-2 p-2 rounded-md hover:bg-white/10 transition-colors text-left"
                      >
                        {newRolePermissions.includes(permission.value) ? (
                          <CheckSquare className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-neutral-200">{permission.label}</div>
                          <div className="text-[10px] text-neutral-500">{permission.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsCreateRoleModalOpen(false)}
                    className="flex-1 rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creatingRole || !newRoleName || newRolePermissions.length === 0}
                    className="flex-1 rounded-full bg-gradient-kleff text-black font-semibold"
                  >
                    {creatingRole ? 'Creating...' : 'Create Role'}
                  </Button>
                </div>
              </form>
            </SoftPanel>
          </div>
        </div>,
        document.body
      )}
    </div>,
    document.body
  );
}
