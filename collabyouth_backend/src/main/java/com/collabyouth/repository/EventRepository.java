package com.collabyouth.repository;

import com.collabyouth.entity.Event;
import com.collabyouth.enums.EventStatus;
import com.collabyouth.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findAllByOrganizationId(UUID organizationId);

    List<Event> findAllByEventStatus(EventStatus eventStatus);

    List<Event> findAllByEventType(EventType eventType);

    List<Event> findAllByOrganizationIdAndEventStatus(UUID organizationId, EventStatus eventStatus);

    // Useful for the public listing page — only published or ongoing events
    List<Event> findAllByEventStatusIn(List<EventStatus> statuses);
}
