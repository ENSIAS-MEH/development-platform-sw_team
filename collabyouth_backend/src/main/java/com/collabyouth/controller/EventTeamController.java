package com.collabyouth.controller;

import com.collabyouth.dto.request.CreateTeamRequest;
import com.collabyouth.dto.response.TeamContributionResponse;
import com.collabyouth.dto.response.TeamDetailsResponse;
import com.collabyouth.entity.Team;
import com.collabyouth.entity.TeamMember;
import com.collabyouth.entity.TeamInvitation;
import com.collabyouth.entity.EventTeam;
import com.collabyouth.entity.Event;
import com.collabyouth.entity.User;
import com.collabyouth.enums.TeamRole;
import com.collabyouth.enums.InvitationStatus;
import com.collabyouth.repository.TeamRepository;
import com.collabyouth.repository.TeamMemberRepository;
import com.collabyouth.repository.EventTeamRepository;
import com.collabyouth.repository.UserRepository;
import com.collabyouth.repository.TeamInvitationRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class EventTeamController {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private EventTeamRepository eventTeamRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamInvitationRepository teamInvitationRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @PostMapping("/events/{eventId}/register-team")
    @Transactional
    public ResponseEntity<?> registerTeam(
            @PathVariable UUID eventId,
            @RequestBody CreateTeamRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("{\"error\": \"User not authenticated via JWT.\"}");
            }

            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Current user not found"));

            Event eventRef = entityManager.getReference(Event.class, eventId);

            Team team = Team.builder()
                    .name(request.getTeamName())
                    .createdBy(currentUser)
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            Team savedTeam = teamRepository.save(team);

            EventTeam eventTeam = EventTeam.builder()
                    .event(eventRef)
                    .team(savedTeam)
                    .registeredAt(OffsetDateTime.now())
                    .build();

            eventTeamRepository.save(eventTeam);

            // ✅ LEADER
            if (!teamMemberRepository.existsByTeamIdAndUserId(savedTeam.getId(), currentUser.getId())) {
                TeamMember leader = TeamMember.builder()
                        .team(savedTeam)
                        .user(currentUser)
                        .teamRole(TeamRole.ADMIN)
                        .joinedAt(OffsetDateTime.now())
                        .build();
                teamMemberRepository.save(leader);
            }

            // ✅ MEMBERS — send invitations instead of adding directly
            if (request.getMembers() != null) {
                for (String rawMemberId : request.getMembers()) {

                    if (rawMemberId == null || rawMemberId.trim().isEmpty()) {
                        continue;
                    }

                    try {
                        UUID memberUuid = UUID.fromString(rawMemberId.trim());

                        // Skip if already a member
                        if (teamMemberRepository.existsByTeamIdAndUserId(savedTeam.getId(), memberUuid)) {
                            continue;
                        }

                        // Skip if already has a pending invitation
                        if (teamInvitationRepository.existsByTeamIdAndInvitedUserIdAndStatus(
                                savedTeam.getId(), memberUuid, InvitationStatus.PENDING)) {
                            continue;
                        }

                        User invitedUser = userRepository.findById(memberUuid)
                                .orElseThrow(() -> new RuntimeException("User not found: " + memberUuid));

                        TeamInvitation invitation = TeamInvitation.builder()
                                .team(savedTeam)
                                .invitedUser(invitedUser)
                                .invitedBy(currentUser)
                                .message("You have been invited to join team: " + savedTeam.getName())
                                .status(InvitationStatus.PENDING)
                                .build();

                        teamInvitationRepository.save(invitation);

                    } catch (IllegalArgumentException e) {
                        System.err.println("[SKIP] Invalid UUID ignored: " + rawMemberId);
                    }
                }
            }

            return ResponseEntity.ok()
                    .body("{\"message\": \"Team successfully created and linked to the event!\"}");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * GET /api/students/me/teams
     */
    @GetMapping("/students/me/teams")
    public ResponseEntity<?> getMyTeamsHistory(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Team> myTeams = teamRepository.findTeamsByStudentId(user.getId());

            List<TeamContributionResponse> response = myTeams.stream().map(team -> {
                EventTeam eventTeam = eventTeamRepository.findByTeamId(team.getId()).orElse(null);
                Event event = (eventTeam != null) ? eventTeam.getEvent() : null;
                long countMembers = teamMemberRepository.countByTeamId(team.getId());
                String userRole = teamMemberRepository.findByTeamIdAndUserId(team.getId(), user.getId())
                        .map(tm -> tm.getTeamRole().name())
                        .orElse("MEMBER");

                return TeamContributionResponse.builder()
                        .id(team.getId().toString())
                        .teamName(team.getName())
                        .eventName(event != null ? event.getTitle() : "Unknown Event")
                        .eventType(event != null ? event.getEventType().name() : "HACKATHON")
                        .role(userRole.equals("ADMIN") ? "LEADER" : "MEMBER")
                        .membersCount(countMembers)
                        .maxTeamSize(event != null ? event.getMaxTeamSize() : 5)
                        .registeredAt(team.getCreatedAt().toString())
                        .eventStatus(event != null ? event.getEventStatus().name() : "PUBLISHED")
                        .build();
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * GET /api/teams/{teamId}/details
     */
    @GetMapping("/teams/{teamId}/details")
    public ResponseEntity<?> getTeamDetails(@PathVariable UUID teamId) {
        try {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team not found"));

            EventTeam eventTeam = eventTeamRepository.findByTeamId(teamId).orElse(null);
            Event event = (eventTeam != null) ? eventTeam.getEvent() : null;

            List<TeamMember> membersEntities = teamMemberRepository.findAllByTeamId(teamId);

            List<TeamDetailsResponse.MemberInfo> membersInfo = membersEntities.stream().map(tm -> {
                UUID memberUserId = tm.getUser().getId();
                User u = userRepository.findById(memberUserId).orElse(tm.getUser());

                return TeamDetailsResponse.MemberInfo.builder()
                        .userId(u.getId().toString())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .email(u.getEmail())
                        .role(tm.getTeamRole().name().equals("ADMIN") ? "LEADER" : "MEMBER")
                        .build();
            }).collect(Collectors.toList());

            TeamDetailsResponse.EventInfo eventInfo = null;
            if (event != null) {
                eventInfo = TeamDetailsResponse.EventInfo.builder()
                        .id(event.getId().toString())
                        .title(event.getTitle())
                        .description(event.getDescription())
                        .eventType(event.getEventType().name())
                        .eventFormat(event.getEventFormat().name())
                        .location(event.getLocation())
                        .startsAt(event.getStartsAt().toString())
                        .endsAt(event.getEndsAt().toString())
                        .minTeamSize(event.getMinTeamSize())
                        .maxTeamSize(event.getMaxTeamSize())
                        .prizeFirst(event.getPrizeFirst())
                        .prizeSecond(event.getPrizeSecond())
                        .prizeThird(event.getPrizeThird())
                        .build();
            }

            TeamDetailsResponse response = TeamDetailsResponse.builder()
                    .teamId(team.getId().toString())
                    .teamName(team.getName())
                    .description(team.getDescription())
                    .createdAt(team.getCreatedAt().toString())
                    .event(eventInfo)
                    .members(membersInfo)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}