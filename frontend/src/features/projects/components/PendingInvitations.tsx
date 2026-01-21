import { useState, useEffect } from "react";
import { Button } from "@shared/ui/Button";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Badge } from "@shared/ui/Badge";
import { Mail, Check, X } from "lucide-react";
import { getMyInvitations, acceptInvitation, rejectInvitation } from "../api/invitations";
import fetchProject from "../api/getProject";
import enTranslations from "@app/locales/en/projects.json";
import frTranslations from "@app/locales/fr/projects.json";
import { getLocale } from "@app/locales/locale";

const translations = {
  en: enTranslations,
  fr: frTranslations
};

interface Invitation {
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

interface InvitationWithProject extends Invitation {
  projectName?: string;
  projectDescription?: string | null;
}

interface PendingInvitationsProps {
  onUpdate?: () => void;
}

export function PendingInvitations({ onUpdate }: PendingInvitationsProps) {
  const [locale, setLocaleState] = useState(getLocale());
  const [invitations, setInvitations] = useState<InvitationWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentLocale = getLocale();
      if (currentLocale !== locale) {
        setLocaleState(currentLocale);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [locale]);

  const t = translations[locale].notifications;

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await getMyInvitations();
      const pending = data.filter((inv) => inv.status === "PENDING");

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
      console.error("Failed to load invitations:", error);
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
      console.error("Failed to accept invitation:", error);
      alert(t.error_accept);
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
      console.error("Failed to reject invitation:", error);
      alert(t.error_reject);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <SoftPanel>
        <p className="text-sm text-neutral-400">{t.loading}</p>
      </SoftPanel>
    );
  }

  return (
    <SoftPanel>
      <div className="mb-4 flex items-center gap-2">
        <Mail className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-neutral-50">{t.title}</h3>
        {invitations.length > 0 && (
          <Badge variant="info" className="text-xs">
            {invitations.length}
          </Badge>
        )}
      </div>

      {invitations.length === 0 ? (
        <div className="py-8 text-center">
          <Mail className="mx-auto mb-3 h-12 w-12 text-neutral-600" />
          <p className="text-sm text-neutral-400">{t.no_notifications}</p>
          <p className="mt-1 text-xs text-neutral-500">{t.all_caught_up}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-medium text-neutral-200">
                    {invitation.projectName || t.project_invitation}
                  </span>
                  <Badge variant="info" className="text-xs">
                    {invitation.customRoleName || invitation.role}
                  </Badge>
                </div>
                {invitation.projectDescription && (
                  <p className="mb-2 text-sm text-neutral-400">{invitation.projectDescription}</p>
                )}
                <p className="text-xs text-neutral-500">
                  {t.expires}: {new Date(invitation.expiresAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(invitation.id)}
                  disabled={processing === invitation.id}
                  className="rounded-full bg-green-500 px-4 text-white hover:bg-green-600"
                >
                  <Check className="mr-1 h-4 w-4" />
                  {t.accept}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleReject(invitation.id)}
                  disabled={processing === invitation.id}
                  className="rounded-full px-4"
                >
                  <X className="mr-1 h-4 w-4" />
                  {t.decline}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SoftPanel>
  );
}
