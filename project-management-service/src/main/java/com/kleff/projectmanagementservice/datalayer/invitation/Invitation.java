package com.kleff.projectmanagementservice.datalayer.invitation;

import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorRole;
import com.kleff.projectmanagementservice.datalayer.collaborator.ProjectPermission;
import com.kleff.projectmanagementservice.datalayer.invitation.InviteStatus;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "invitations")
public class Invitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "project_id")
    private String projectId;

    @Column(name = "inviter_id")
    private String inviterId;

    @Column(name = "invitee_email")
    private String inviteeEmail;

    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private CollaboratorRole role;

    @Column(name = "custom_role_id")
    private Integer customRoleId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "invitation_permissions", joinColumns = @JoinColumn(name = "invitation_id"))
    @Column(name = "permission")
    @Enumerated(EnumType.STRING)
    private Set<ProjectPermission> permissions;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private InviteStatus status;

    @Nullable
    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();
}