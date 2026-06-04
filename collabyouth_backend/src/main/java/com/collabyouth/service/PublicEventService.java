package com.collabyouth.service;

import com.collabyouth.dto.response.EventSummaryResponse;
import com.collabyouth.entity.Event;
import com.collabyouth.enums.EventStatus;
import com.collabyouth.enums.EventType;
import com.collabyouth.repository.EventRepository;
import com.collabyouth.repository.EventTeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class PublicEventService {

    private final EventRepository eventRepository;
    private final EventTeamRepository eventTeamRepository;

    public PublicEventService(EventRepository eventRepository, EventTeamRepository eventTeamRepository) {
        this.eventRepository = eventRepository;
        this.eventTeamRepository = eventTeamRepository;
    }

    @Transactional(readOnly = true)
    public List<EventSummaryResponse> getPublishedEvents(String type, String query, Integer limit) {
        List<Event> events = eventRepository.findAllByEventStatus(EventStatus.PUBLISHED);
        Stream<Event> eventStream = events.stream();

        if (type != null && !type.isBlank() && !type.equalsIgnoreCase("ALL")) {
            try {
                EventType typeEnum = EventType.valueOf(type.trim().toUpperCase());
                eventStream = eventStream.filter(e -> e.getEventType() == typeEnum);
            } catch (IllegalArgumentException ex) {
                // Ignore le filtre si le type est incorrect
            }
        }

        if (query != null && !query.isBlank()) {
            String lowerQuery = query.trim().toLowerCase();
            eventStream = eventStream.filter(e -> 
                (e.getTitle() != null && e.getTitle().toLowerCase().contains(lowerQuery)) ||
                (e.getDescription() != null && e.getDescription().toLowerCase().contains(lowerQuery))
            );
        }

        if (limit != null && limit > 0) {
            eventStream = eventStream.limit(limit);
        }

        return eventStream.map(this::toSummaryResponse).collect(Collectors.toList());
    }

    private EventSummaryResponse toSummaryResponse(Event e) {
        long registeredTeams = eventTeamRepository.countByEventId(e.getId());
        
        return new EventSummaryResponse(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getEventType(),
                e.getEventStatus(),
                e.getEventFormat(),
                e.getLocation(),
                e.getStartsAt(),
                e.getEndsAt(),
                e.getMaxTeams(),
                e.getMinTeamSize(),
                e.getMaxTeamSize(),
                e.getPrizeFirst() != null ? e.getPrizeFirst().trim() : "",
                e.getPrizeSecond() != null ? e.getPrizeSecond().trim() : "",
                e.getPrizeThird() != null ? e.getPrizeThird().trim() : "",
                e.getTags(),
                registeredTeams
        );
    }
}