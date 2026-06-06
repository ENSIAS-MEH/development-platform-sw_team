package com.collabyouth.controller;

import com.collabyouth.dto.request.StudentProfileRequest;
import com.collabyouth.dto.response.InvitationResponse;
import com.collabyouth.dto.response.StudentProfileResponse;
import com.collabyouth.dto.response.StudentStatsResponse;
import com.collabyouth.entity.TeamInvitation;
import com.collabyouth.entity.TeamMember;
import com.collabyouth.enums.InvitationStatus;
import com.collabyouth.enums.TeamRole;
import com.collabyouth.repository.EventTeamRepository;
import com.collabyouth.repository.TeamInvitationRepository;
import com.collabyouth.repository.TeamMemberRepository;
import com.collabyouth.repository.TeamRepository;
import com.collabyouth.repository.UserRepository;
import com.collabyouth.service.StudentProfileService;
import jakarta.validation.Valid;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/student", "/api/students"})
public class StudentController {

    private final StudentProfileService profileService;

    @Autowired private TeamMemberRepository teamMemberRepository;
    @Autowired private TeamInvitationRepository teamInvitationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TeamRepository teamRepository;
    @Autowired private EventTeamRepository eventTeamRepository;

    public StudentController(StudentProfileService profileService) {
        this.profileService = profileService;
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<StudentProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<StudentProfileResponse> updateProfile(
            @Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }

    // ── Invitations ───────────────────────────────────────────────────────────

    @GetMapping("/invitations")
    public ResponseEntity<List<InvitationResponse>> getPendingInvitations(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UUID userId = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();

            List<InvitationResponse> invitations = teamInvitationRepository
                    .findAllByInvitedUserIdAndStatus(userId, InvitationStatus.PENDING)
                    .stream()
                    .map(inv -> {
                        String eventTitle = eventTeamRepository
                                .findByTeamId(inv.getTeam().getId())
                                .map(et -> et.getEvent().getTitle())
                                .orElse(inv.getTeam().getName());

                        String fromName = inv.getInvitedBy().getFirstName()
                                + " " + inv.getInvitedBy().getLastName();

                        return new InvitationResponse(
                                inv.getId(),
                                fromName,
                                eventTitle,
                                inv.getCreatedAt()
                        );
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/invitations/{invitationId}/accept")
    @Transactional
    public ResponseEntity<?> acceptTeamInvitation(
            @PathVariable UUID invitationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                    .orElseThrow(() -> new RuntimeException("Invitation not found"));

            invitation.setStatus(InvitationStatus.ACCEPTED);
            invitation.setRespondedAt(OffsetDateTime.now());
            teamInvitationRepository.save(invitation);

            TeamMember newMember = new TeamMember();
            newMember.setTeam(invitation.getTeam());
            newMember.setUser(invitation.getInvitedUser());
            newMember.setTeamRole(TeamRole.MEMBER);
            newMember.setJoinedAt(OffsetDateTime.now());
            teamMemberRepository.save(newMember);

            return ResponseEntity.ok().body("{\"message\": \"You have successfully joined the team!\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/invitations/{invitationId}/decline")
    @Transactional
    public ResponseEntity<?> declineTeamInvitation(
            @PathVariable UUID invitationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                    .orElseThrow(() -> new RuntimeException("Invitation not found"));

            invitation.setStatus(InvitationStatus.DECLINED);
            invitation.setRespondedAt(OffsetDateTime.now());
            teamInvitationRepository.save(invitation);

            return ResponseEntity.ok().body("{\"message\": \"Invitation declined.\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<StudentStatsResponse> getStudentStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UUID userId = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();

            long teamsFormed = teamMemberRepository.countByUserId(userId);
            long pendingInvites = teamInvitationRepository
                    .findAllByInvitedUserIdAndStatus(userId, InvitationStatus.PENDING)
                    .size();

            return ResponseEntity.ok(new StudentStatsResponse(
                    teamsFormed,  // eventsJoined (approximated by teams)
                    teamsFormed,
                    pendingInvites,
                    0L            // profileViews — not tracked yet
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}