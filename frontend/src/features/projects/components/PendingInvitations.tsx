import { useState, useEffect } from 'react';
import { Button } from '@shared/ui/Button';
import { SoftPanel } from '@shared/ui/SoftPanel';
import { Badge } from '@shared/ui/Badge';
import { Mail, Check, X } from 'lucide-react';
import { getMyInvitations, acceptInvitation, rejectInvitation } from '../api/invitations';
import fetchProject from '../api/getProject';

interface Invitation {
  id: number;
  projectId: string;
  inviterId: string;
  inviteeEmail: string;
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  customRoleId?: number;
  customRoleName?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

interface InvitationWithProject extends Invitation {
  projectName?: string;
  projectDescription?: string | null;
}

interface PendingInvitationsProps {
  onUpdate?: () => void;
}

export function PendingInvitations({ onUpdate }: PendingInvitationsProps) {
  const [invitations, setInvitations] = useState<InvitationWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await getMyInvitations();
      const pending = data.filter(inv => inv.status === 'PENDING');
      
      const enriched = await Promise.all(
        pending.map(async (inv) => {
          try {
            const project = await fetchProject(inv.projectId);
            return {
              ...inv,
              projectName: project.name,
              projectDescription: project.description
            };
          } catch (error) {
            console.error(`Failed to fetch project ${inv.projectId}:`, error);
            return inv;
          }
        })
      );
      
      setInvitations(enriched);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleAccept = async (invitationId: number) => {
    try {
      setProcessing(invitationId);
      await acceptInvitation(invitationId);
      await loadInvitations();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      alert('Failed to accept invitation');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (invitationId: number) => {
    try {
      setProcessing(invitationId);
      await rejectInvitation(invitationId);
      await loadInvitations();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to reject invitation:', error);
      alert('Failed to reject invitation');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <SoftPanel>
        <p className="text-sm text-neutral-400">Loading invitations...</p>
      </SoftPanel>
    );
  }

  return (
    <SoftPanel>
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-neutral-50">Pending Invitations</h3>
        {invitations.length > 0 && (
          <Badge variant="info" className="text-xs">
            {invitations.length}
          </Badge>
        )}
      </div>

      {invitations.length === 0 ? (
        <div className="py-8 text-center">
          <Mail className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">No notifications</p>
          <p className="text-xs text-neutral-500 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-neutral-200">
                  {invitation.projectName || 'Project Invitation'}
                </span>
                <Badge variant="info" className="text-xs">
                  {invitation.customRoleName || invitation.role}
                </Badge>
              </div>
              {invitation.projectDescription && (
                <p className="text-sm text-neutral-400 mb-2">
                  {invitation.projectDescription}
                </p>
              )}
              <p className="text-xs text-neutral-500">
                Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAccept(invitation.id)}
                disabled={processing === invitation.id}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full px-4"
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleReject(invitation.id)}
                disabled={processing === invitation.id}
                className="rounded-full px-4"
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        ))}
        </div>
      )}
    </SoftPanel>
  );
}
