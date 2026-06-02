package com.collabyouth.repository;

import com.collabyouth.entity.EventTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventTeamRepository extends JpaRepository<EventTeam, UUID> {
    long countByEventId(UUID eventId);
    List<EventTeam> findAllByEventId(UUID eventId);
}