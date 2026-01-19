package com.kleff.projectmanagementservice.datalayer.invitation;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvitationRepository extends JpaRepository<Invitation, Integer> {
    List<Invitation> findByInviteeEmailAndStatus(String inviteeEmail, InviteStatus status);

    List<Invitation> findByProjectIdAndStatus(String projectId, InviteStatus status);
}
