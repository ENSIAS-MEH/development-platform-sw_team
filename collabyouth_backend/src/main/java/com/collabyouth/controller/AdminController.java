package com.collabyouth.controller;

import com.collabyouth.dto.response.MessageResponse;
import com.collabyouth.dto.response.OrgSummaryResponse;
import com.collabyouth.dto.response.UserSummaryResponse;
import com.collabyouth.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ── Users ────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // ── Organizations ────────────────────────────────────────────────
    @GetMapping("/organizations/pending")
    public ResponseEntity<List<OrgSummaryResponse>> getPendingOrgs() {
        return ResponseEntity.ok(adminService.getPendingOrganizations());
    }

    @GetMapping("/organizations")
    public ResponseEntity<List<OrgSummaryResponse>> getAllOrgs() {
        return ResponseEntity.ok(adminService.getAllOrganizations());
    }

    @PostMapping("/organizations/{id}/approve")
    public ResponseEntity<MessageResponse> approveOrg(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.approveOrganization(id));
    }

    @PostMapping("/organizations/{id}/reject")
    public ResponseEntity<MessageResponse> rejectOrg(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.rejectOrganization(id));
    }
}
