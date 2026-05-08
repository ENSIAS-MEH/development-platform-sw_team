package com.collabyouth.service;

import com.collabyouth.dto.response.MessageResponse;
import com.collabyouth.dto.response.OrgSummaryResponse;
import com.collabyouth.entity.Organization;
import com.collabyouth.enums.AccountStatus;
import com.collabyouth.repository.OrganizationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final OrganizationRepository organizationRepository;

    public AdminService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public List<OrgSummaryResponse> getPendingOrganizations() {
        return organizationRepository.findByStatus(AccountStatus.PENDING)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    public List<OrgSummaryResponse> getAllOrganizations() {
        return organizationRepository.findAll()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    public MessageResponse approveOrganization(UUID id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        org.setStatus(AccountStatus.ACTIVE);
        organizationRepository.save(org);

        return new MessageResponse("Organization approved successfully");
    }

    public MessageResponse rejectOrganization(UUID id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        org.setStatus(AccountStatus.REJECTED);
        organizationRepository.save(org);

        return new MessageResponse("Organization rejected");
    }

    private OrgSummaryResponse toSummary(Organization org) {
        return new OrgSummaryResponse(
                org.getId(),
                org.getName(),
                org.getEmail(),
                org.getDescription(),
                org.getWebsiteUrl(),
                org.getLocation(),
                org.getStatus().name()
        );
    }
}
