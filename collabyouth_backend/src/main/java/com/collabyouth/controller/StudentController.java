package com.collabyouth.controller;

import com.collabyouth.dto.request.StudentProfileRequest;
import com.collabyouth.dto.response.StudentProfileResponse;
import com.collabyouth.entity.TeamInvitation;
import com.collabyouth.entity.TeamMember;
import com.collabyouth.enums.InvitationStatus;
import com.collabyouth.enums.TeamRole;
import com.collabyouth.repository.TeamInvitationRepository;
import com.collabyouth.repository.TeamMemberRepository;
import com.collabyouth.repository.TeamRepository;
import com.collabyouth.repository.UserRepository;
import com.collabyouth.service.StudentProfileService;
import jakarta.validation.Valid;

import java.time.OffsetDateTime;
import java.util.UUID;

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

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TeamInvitationRepository teamInvitationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    public StudentController(StudentProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<StudentProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<StudentProfileResponse> updateProfile(
            @Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }

    @PostMapping("/invitations/{invitationId}/accept")
    @Transactional
    public ResponseEntity<?> acceptTeamInvitation(
            @PathVariable UUID invitationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 1. Récupération de l'invitation
            TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                    .orElseThrow(() -> new RuntimeException("Invitation not found"));

            // 2. Mise à jour de l'invitation
            invitation.setStatus(InvitationStatus.ACCEPTED);
            invitation.setRespondedAt(OffsetDateTime.now());
            teamInvitationRepository.save(invitation);

            // 3. Version ultra-compatible sans Builder (Setters classiques)
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
}