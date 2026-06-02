package com.collabyouth.service;

import com.collabyouth.dto.request.CreateEventRequest;
import com.collabyouth.dto.response.EventSummaryResponse;
import com.collabyouth.dto.response.OrgDashboardStats;
import com.collabyouth.entity.Event;
import com.collabyouth.entity.Organization;
import com.collabyouth.enums.EventStatus;
import com.collabyouth.repository.EventRepository;
import com.collabyouth.repository.EventTeamRepository;
import com.collabyouth.repository.OrganizationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class OrgEventService {

    private final EventRepository eventRepository;
    private final EventTeamRepository eventTeamRepository;
    private final OrganizationRepository organizationRepository;

    public OrgEventService(EventRepository eventRepository,
                           EventTeamRepository eventTeamRepository,
                           OrganizationRepository organizationRepository) {
        this.eventRepository = eventRepository;
        this.eventTeamRepository = eventTeamRepository;
        this.organizationRepository = organizationRepository;
    }

    // ----------------------------------------------------------------
    // Liste des events de l'org
    // ----------------------------------------------------------------
    public List<EventSummaryResponse> getOrgEvents(UUID orgId) {
        return eventRepository.findAllByOrganizationId(orgId)
                .stream()
                .map(e -> toSummary(e, eventTeamRepository.countByEventId(e.getId())))
                .toList();
    }

    // ----------------------------------------------------------------
    // Stats dashboard
    // ----------------------------------------------------------------
    public OrgDashboardStats getOrgStats(UUID orgId) {
        List<Event> events = eventRepository.findAllByOrganizationId(orgId);

        long totalEvents = events.size();

        long activeEvents = events.stream()
                .filter(e -> EventStatus.PUBLISHED.equals(e.getEventStatus()))
                .count();

        long totalTeams = events.stream()
                .mapToLong(e -> eventTeamRepository.countByEventId(e.getId()))
                .sum();

        double avgFillRate = events.stream()
                .filter(e -> e.getMaxTeams() != null && e.getMaxTeams() > 0)
                .mapToDouble(e -> {
                    long registered = eventTeamRepository.countByEventId(e.getId());
                    return (double) registered / e.getMaxTeams() * 100;
                })
                .average()
                .orElse(0.0);

        return new OrgDashboardStats(
                totalEvents,
                activeEvents,
                totalTeams,
                Math.round(avgFillRate * 10.0) / 10.0
        );
    }

    // ----------------------------------------------------------------
    // Créer un événement
    // ----------------------------------------------------------------
    public EventSummaryResponse createEvent(UUID orgId, CreateEventRequest request) {

        if (request.endsAt().isBefore(request.startsAt())) {
            throw new IllegalArgumentException("La date de fin doit être après la date de début");
        }

        if (request.maxTeamSize() < request.minTeamSize()) {
            throw new IllegalArgumentException("La taille max doit être >= à la taille min");
        }

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organisation introuvable"));

        Event event = Event.builder()
                .organization(org)
                .title(request.title())
                .description(request.description())
                .eventType(request.eventType())
                .eventFormat(request.eventFormat())
                .eventStatus(EventStatus.DRAFT) // IMPORTANT: pas publié direct
                .location(request.location())
                .startsAt(request.startsAt())
                .endsAt(request.endsAt())
                .maxTeams(request.maxTeams())
                .minTeamSize(request.minTeamSize())
                .maxTeamSize(request.maxTeamSize())
                .prizeFirst(request.prizeFirst())
                .prizeSecond(request.prizeSecond())
                .prizeThird(request.prizeThird())
                .tags(request.tags())
                .build();

        Event saved = eventRepository.save(event);

        return toSummary(saved, 0L);
    }

    // ----------------------------------------------------------------
    // Mapper
    // ----------------------------------------------------------------
    private EventSummaryResponse toSummary(Event e, long registeredTeams) {
        return new EventSummaryResponse(
                e.getId(),
                e.getTitle(),
                e.getEventType(),
                e.getEventStatus(),
                e.getEventFormat(),
                e.getLocation(),
                e.getStartsAt(),
                e.getEndsAt(),
                e.getMaxTeams(),
                e.getMinTeamSize(),
                e.getMaxTeamSize(),
                e.getPrizeFirst(),
                e.getPrizeSecond(),
                e.getPrizeThird(),
                e.getTags(),
                registeredTeams
        );
    }
}