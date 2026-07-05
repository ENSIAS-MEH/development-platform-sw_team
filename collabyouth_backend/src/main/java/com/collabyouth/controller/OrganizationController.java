package com.collabyouth.controller;

import com.collabyouth.dto.request.OrgProfileRequest;
import com.collabyouth.dto.response.OrgProfileResponse;
import com.collabyouth.repository.OrganizationRepository; 
import com.collabyouth.entity.Organization; 

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody; // ✅ Import indispensable ajouté ici
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/org")
public class OrganizationController {

    private final OrganizationRepository organizationRepository;

    public OrganizationController(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<OrgProfileResponse> getProfile(Principal principal) {
        String email = principal.getName();

        Organization org = organizationRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Structure organisatrice introuvable"));

        OrgProfileResponse response = new OrgProfileResponse(
                org.getId(),
                org.getName(),
                org.getEmail(),
                org.getDescription(),  
                org.getWebsiteUrl(),   
                org.getCreatedAt() 
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<OrgProfileResponse> updateProfile(Principal principal, @RequestBody OrgProfileRequest request) {
        String email = principal.getName();

        // 1. Récupérer l'organisation existante
        Organization org = organizationRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Structure organisatrice introuvable"));

        // 2. Mettre à jour les champs autorisés
        org.setDescription(request.getBio());
        org.setWebsiteUrl(request.getWebsite());

        // 3. Sauvegarder les modifications dans PostgreSQL
        Organization updatedOrg = organizationRepository.save(org);

        // 4. Retourner le profil mis à jour
        OrgProfileResponse response = new OrgProfileResponse(
                updatedOrg.getId(),
                updatedOrg.getName(),
                updatedOrg.getEmail(),
                updatedOrg.getDescription(),  
                updatedOrg.getWebsiteUrl(),   
                updatedOrg.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }
}