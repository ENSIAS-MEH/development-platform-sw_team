package com.collabyouth.repository;

import com.collabyouth.entity.HackathonRegistration;
import com.collabyouth.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HackathonRegistrationRepository extends JpaRepository<HackathonRegistration, UUID> {

    List<HackathonRegistration> findAllByEventId(UUID eventId);

    List<HackathonRegistration> findAllByEventIdAndStatus(UUID eventId, RegistrationStatus status);

    List<HackathonRegistration> findAllByTeamId(UUID teamId);

    // Check if this team already has a pending or accepted registration for an event
    boolean existsByEventIdAndTeamIdAndStatusIn(UUID eventId, UUID teamId, List<RegistrationStatus> statuses);

    Optional<HackathonRegistration> findByEventIdAndTeamId(UUID eventId, UUID teamId);

    // For a requesting user to view their own submissions
    List<HackathonRegistration> findAllByRequestedById(UUID requestedById);
}
