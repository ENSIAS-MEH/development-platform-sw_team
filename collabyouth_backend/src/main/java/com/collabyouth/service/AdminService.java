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
    private final EmailService emailService;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public AdminService(OrganizationRepository organizationRepository, UserRepository userRepository, EmailService emailService) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
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

        String link = "http://localhost:3000/home/login";
        String name = org.getName();

        String html = "<div style='font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)'>"
            + "<div style='background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 32px;text-align:center'>"
            + "<h1 style='color:white;margin:0;font-size:28px;font-weight:700'>CollabYouth</h1>"
            + "<p style='color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px'>Connecting youth with opportunities</p>"
            + "</div>"
            + "<div style='padding:40px 32px'>"
            + "<div style='text-align:center;margin-bottom:32px'>"
            + "<div style='font-size:48px'>🎉</div>"
            + "<h2 style='color:#1e1b4b;font-size:24px;margin:16px 0 8px'>Congratulations!</h2>"
            + "<p style='color:#6b7280;font-size:15px;margin:0'>Your account has been approved</p>"
            + "</div>"
            + "<p style='color:#374151;font-size:15px;line-height:1.6'>Hello <strong>" + name + "</strong>,</p>"
            + "<p style='color:#374151;font-size:15px;line-height:1.6'>We are pleased to inform you that your organization has been <strong style='color:#4f46e5'>approved</strong> on the CollabYouth platform. You can now access your dashboard and start publishing your opportunities.</p>"
            + "<div style='text-align:center;margin:36px 0'>"
            + "<a href='" + link + "' style='background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;display:inline-block'>Access my dashboard →</a>"
            + "</div>"
            + "<p style='color:#9ca3af;font-size:13px'>Questions? Reach us at <a href='mailto:collabyouth20@gmail.com' style='color:#4f46e5'>support@collabyouth.com</a></p>"
            + "</div>"
            + "<div style='background:#f9fafb;padding:24px 32px;text-align:center;border-top:1px solid #e5e7eb'>"
            + "<p style='color:#9ca3af;font-size:12px;margin:0'>© 2026 CollabYouth · All rights reserved<br>This is an automated email, please do not reply.</p>"
            + "</div>"
            + "</div>";

        emailService.sendHtmlEmail(org.getEmail(), "Your CollabYouth account has been approved ✅", html);
        return new MessageResponse("Organization approved successfully");
    }

    public MessageResponse rejectOrganization(UUID id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        org.setStatus(AccountStatus.REJECTED);
        organizationRepository.save(org);

        String name = org.getName();

        String html = "<div style='font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)'>"
            + "<div style='background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 32px;text-align:center'>"
            + "<h1 style='color:white;margin:0;font-size:28px;font-weight:700'>CollabYouth</h1>"
            + "<p style='color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px'>Connecting youth with opportunities</p>"
            + "</div>"
            + "<div style='padding:40px 32px'>"
            + "<div style='text-align:center;margin-bottom:32px'>"
            + "<div style='font-size:48px'>📋</div>"
            + "<h2 style='color:#1e1b4b;font-size:24px;margin:16px 0 8px'>Decision regarding your application</h2>"
            + "<p style='color:#6b7280;font-size:15px;margin:0'>Following the review of your application</p>"
            + "</div>"
            + "<p style='color:#374151;font-size:15px;line-height:1.6'>Hello <strong>" + name + "</strong>,</p>"
            + "<p style='color:#374151;font-size:15px;line-height:1.6'>After careful review of your application, we regret to inform you that your registration request on CollabYouth could not be accepted at this time.</p>"
            + "<div style='background:#fef3c7;border-left:4px solid #f59e0b;border-radius:6px;padding:16px 20px;margin:24px 0'>"
            + "<p style='color:#92400e;font-size:14px;margin:0;line-height:1.6'>For more information or to submit a new application, please contact our support team.</p>"
            + "</div>"
            + "<p style='color:#374151;font-size:15px;line-height:1.6'>We remain available and hope to welcome you to our platform in the future.</p>"
            + "<div style='text-align:center;margin:36px 0'>"
            + "<a href='mailto:collabyouth20@gmail.com' style='background:#f3f4f6;color:#374151;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;display:inline-block;border:1px solid #e5e7eb'>Contact Support</a>"
            + "</div>"
            + "</div>"
            + "<div style='background:#f9fafb;padding:24px 32px;text-align:center;border-top:1px solid #e5e7eb'>"
            + "<p style='color:#9ca3af;font-size:12px;margin:0'>© 2026 CollabYouth · All rights reserved<br>This is an automated email, please do not reply.</p>"
            + "</div>"
            + "</div>";

        emailService.sendHtmlEmail(org.getEmail(), "Update regarding your CollabYouth application", html);
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