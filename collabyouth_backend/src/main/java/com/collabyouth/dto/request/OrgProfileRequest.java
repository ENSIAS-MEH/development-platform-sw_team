package com.collabyouth.dto.request;

public class OrgProfileRequest {
    private String bio;     // Fait référence à description
    private String website; // Fait référence à websiteUrl
    private String github;  // Optionnel : si tu décides d'ajouter une colonne GitHub plus tard

    // Constructeur par défaut requis par Jackson
    public OrgProfileRequest() {}

    public OrgProfileRequest(String bio, String website, String github) {
        this.bio = bio;
        this.website = website;
        this.github = github;
    }

    // ── Getters et Setters ──────────────────────────────────────────
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }
}