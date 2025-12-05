package com.kleff.userservice.dataaccess;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(name = "authentik_uid", nullable = false, updatable = false, length = 64)
    private String authentikUid;

    @Column(name = "theme", nullable = false)
    private String theme = "dark";

    @Column(name = "timezone")
    private String timezone;

    @Column(name = "marketing_emails", nullable = false)
    private boolean marketingEmails = false;
}
