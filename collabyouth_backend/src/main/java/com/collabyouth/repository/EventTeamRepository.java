package com.collabyouth.repository;

import com.collabyouth.entity.EventTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventTeamRepository extends JpaRepository<EventTeam, UUID> {

    // CORRECTION : L'ID de l'équipe est un UUID dans ton schéma SQL
    Optional<EventTeam> findByTeamId(UUID teamId);

    @Query("SELECT COUNT(et) FROM EventTeam et WHERE et.event.id = :eventId")
    long countByEventId(@Param("eventId") UUID eventId);

    @Query("SELECT et FROM EventTeam et JOIN FETCH et.team t JOIN FETCH t.createdBy WHERE et.event.id = :eventId")
    List<EventTeam> findAllByEventId(@Param("eventId") UUID eventId);
}