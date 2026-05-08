package com.collabyouth.service;

import com.collabyouth.dto.response.MessageResponse;
import com.collabyouth.dto.response.OrgSummaryResponse;
import com.collabyouth.dto.response.UserSummaryResponse;
import com.collabyouth.entity.Organization;
import com.collabyouth.entity.User;
import com.collabyouth.enums.AccountStatus;
import com.collabyouth.repository.OrganizationRepository;
import com.collabyouth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public AdminService(OrganizationRepository organizationRepository,
                        UserRepository userRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    // ----------------------------------------------------------------
    // Users
    // ----------------------------------------------------------------
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserSummary)
                .toList();
    }

    // ----------------------------------------------------------------
    // Organizations
    // ----------------------------------------------------------------
    public List<OrgSummaryResponse> getPendingOrganizations() {
        return organizationRepository.findByStatus(AccountStatus.PENDING)
                .stream()
                .map(this::toOrgSummary)
                .toList();
    }

    public List<OrgSummaryResponse> getAllOrganizations() {
        return organizationRepository.findAll()
                .stream()
                .map(this::toOrgSummary)
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

    // ----------------------------------------------------------------
    // Mappers
    // ----------------------------------------------------------------
    private UserSummaryResponse toUserSummary(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name()
        );
    }

    private OrgSummaryResponse toOrgSummary(Organization org) {
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
