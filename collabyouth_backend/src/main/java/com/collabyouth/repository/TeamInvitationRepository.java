package com.collabyouth.repository;

import com.collabyouth.entity.TeamInvitation;
import com.collabyouth.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, UUID> {

    // Invitations received by a user
    List<TeamInvitation> findAllByInvitedUserIdOrderByCreatedAtDesc(UUID invitedUserId);

    // Pending invitations received by a user
    List<TeamInvitation> findAllByInvitedUserIdAndStatus(UUID invitedUserId, InvitationStatus status);

    // Invitations sent by a user for a given team
    List<TeamInvitation> findAllByTeamIdAndInvitedById(UUID teamId, UUID invitedById);

    // All invitations for a team
    List<TeamInvitation> findAllByTeamId(UUID teamId);

    // Check if a pending invitation already exists for this user+team combo
    boolean existsByTeamIdAndInvitedUserIdAndStatus(UUID teamId, UUID invitedUserId, InvitationStatus status);

    Optional<TeamInvitation> findByIdAndInvitedUserId(UUID id, UUID invitedUserId);
}
