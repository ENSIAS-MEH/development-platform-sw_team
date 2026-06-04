package com.collabyouth.dto.response;

import java.time.OffsetDateTime; // ✅ Import modifié
import java.util.UUID;

public class OrgProfileResponse {
    private UUID id;
    private String name;
    private String email;
    private String organizationName;
    private String bio;
    private String website;
    private OffsetDateTime createdAt; // ✅ Changé en OffsetDateTime

    // Constructeur complet
    public OrgProfileResponse(UUID id, String name, String email, String bio, String website, OffsetDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.organizationName = name;
        this.email = email;
        this.bio = bio;
        this.website = website;
        this.createdAt = createdAt;
    }

    // ── Getters et Setters ──────────────────────────────────────────
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}