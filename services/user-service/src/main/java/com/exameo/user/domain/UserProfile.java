package com.exameo.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.UUID;

/**
 * Profil utilisateur. L'identité (auth) est dans Keycloak ; nous indexons par
 * {@code keycloakId} pour rapatrier les attributs métier locaux.
 */
@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "keycloak_id", unique = true, nullable = false)
    private String keycloakId;

    @NotBlank
    @Column(name = "username", nullable = false)
    private String username;

    @Email
    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_role", nullable = false, length = 32)
    private UserRole primaryRole;

    @Column(name = "locale", length = 8)
    private String locale = "fr";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected UserProfile() {}

    public UserProfile(String keycloakId, String username, String email, UserRole primaryRole) {
        this.keycloakId = keycloakId;
        this.username = username;
        this.email = email;
        this.primaryRole = primaryRole;
    }

    public UUID getId() { return id; }
    public String getKeycloakId() { return keycloakId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public UserRole getPrimaryRole() { return primaryRole; }
    public String getLocale() { return locale; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setFirstName(String firstName) { this.firstName = firstName; this.updatedAt = Instant.now(); }
    public void setLastName(String lastName) { this.lastName = lastName; this.updatedAt = Instant.now(); }
    public void setLocale(String locale) { this.locale = locale; this.updatedAt = Instant.now(); }
    public void setPrimaryRole(UserRole role) { this.primaryRole = role; this.updatedAt = Instant.now(); }
    public void setEmail(String email) { this.email = email; this.updatedAt = Instant.now(); }
}
