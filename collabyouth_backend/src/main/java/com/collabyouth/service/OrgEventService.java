package com.collabyouth.service;

import com.collabyouth.dto.request.CreateEventRequest;
import com.collabyouth.dto.request.UpdateEventRequest;
import com.collabyouth.dto.response.EventParticipantTeamResponse;
import com.collabyouth.dto.response.EventSummaryResponse;
import com.collabyouth.dto.response.OrgDashboardStats;
import com.collabyouth.entity.Event;
import com.collabyouth.entity.Organization;
import com.collabyouth.entity.Team;
import com.collabyouth.entity.User;
import com.collabyouth.enums.EventStatus;
import com.collabyouth.repository.EventRepository;
import com.collabyouth.repository.EventTeamRepository;
import com.collabyouth.repository.OrganizationRepository;
import com.collabyouth.repository.TeamMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class OrgEventService {

    private final EventRepository eventRepository;
    private final EventTeamRepository eventTeamRepository;
    private final OrganizationRepository organizationRepository;
    private final TeamMemberRepository teamMemberRepository;

    public OrgEventService(EventRepository eventRepository,
                           EventTeamRepository eventTeamRepository,
                           OrganizationRepository organizationRepository,
                           TeamMemberRepository teamMemberRepository) {
        this.eventRepository = eventRepository;
        this.eventTeamRepository = eventTeamRepository;
        this.organizationRepository = organizationRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    public List<EventSummaryResponse> getOrgEvents(UUID orgId) {
        return eventRepository.findAllByOrganizationId(orgId)
                .stream()
                .map(e -> toSummary(e, eventTeamRepository.countByEventId(e.getId())))
                .toList();
    }

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

        return new OrgDashboardStats(totalEvents, activeEvents, totalTeams, Math.round(avgFillRate * 10.0) / 10.0);
    }

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
                .eventStatus(EventStatus.PUBLISHED)
                .location(request.location())
                .startsAt(request.startsAt())
                .endsAt(request.endsAt())
                .maxTeams(request.maxTeams())
                .minTeamSize(request.minTeamSize())
                .maxTeamSize(request.maxTeamSize())
                .prizeFirst(request.prizeFirst())
                .prizeSecond(request.prizeSecond())
                .prizeThird(request.prizeThird())
                .tags(request.tags() != null ? request.tags() : Set.of())
                .build();

        Event saved = eventRepository.save(event);
        return toSummary(saved, 0L);
    }

    @Transactional
    public EventSummaryResponse updateEvent(UUID orgId, UUID eventId, UpdateEventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Événement introuvable"));

        if (!event.getOrganization().getId().equals(orgId)) {
            throw new IllegalStateException("Vous n'êtes pas autorisé à modifier cet événement");
        }

        if (request.endsAt().isBefore(request.startsAt())) {
            throw new IllegalArgumentException("La date de fin doit être après la date de début");
        }

        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setEventType(request.eventType());
        event.setEventFormat(request.eventFormat());
        event.setLocation(request.location());
        event.setStartsAt(request.startsAt());
        event.setEndsAt(request.endsAt());
        event.setMaxTeams(request.maxTeams());
        event.setMinTeamSize(request.minTeamSize());
        event.setMaxTeamSize(request.maxTeamSize());
        event.setPrizeFirst(request.prizeFirst());
        event.setPrizeSecond(request.prizeSecond());
        event.setPrizeThird(request.prizeThird());
        event.setTags(request.tags() != null ? request.tags() : Set.of());

        Event updated = eventRepository.save(event);
        long countTeams = eventTeamRepository.countByEventId(updated.getId());
        return toSummary(updated, countTeams);
    }

    @Transactional
    public List<EventParticipantTeamResponse> getEventParticipants(UUID orgId, UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Événement introuvable"));

        if (!event.getOrganization().getId().equals(orgId)) {
            throw new IllegalStateException("Accès refusé à la liste des participants");
        }

        return eventTeamRepository.findAllByEventId(eventId).stream()
                .map(et -> {
                    Team team = et.getTeam();
                    User leader = team.getCreatedBy();
                    String leaderName = leader.getFirstName() + " " + leader.getLastName();

                    List<EventParticipantTeamResponse.TeamMemberInfo> members =
                        teamMemberRepository.findAllByTeamId(team.getId()).stream()
                            .map(tm -> new EventParticipantTeamResponse.TeamMemberInfo(
                                tm.getUser().getId(),
                                tm.getUser().getFirstName() + " " + tm.getUser().getLastName(),
                                tm.getTeamRole().name()
                            ))
                            .toList();

                    return new EventParticipantTeamResponse(
                            team.getId(),
                            team.getName(),
                            team.getDescription(),
                            leaderName,
                            et.getRegisteredAt(),
                            members
                    );
                })
                .toList();
    }

    @Transactional
    public EventSummaryResponse closeEvent(UUID orgId, UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Événement introuvable"));

        if (!event.getOrganization().getId().equals(orgId)) {
            throw new IllegalStateException("Vous n'êtes pas autorisé à clôturer cet événement");
        }

        event.setEventStatus(EventStatus.CLOSED);

        Event saved = eventRepository.save(event);
        long countTeams = eventTeamRepository.countByEventId(saved.getId());
        return toSummary(saved, countTeams);
    }

    public EventSummaryResponse getEventDetails(UUID orgId, UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Événement introuvable"));

        if (!event.getOrganization().getId().equals(orgId)) {
            throw new IllegalStateException("Vous n'avez pas accès à cet événement");
        }

        long countTeams = eventTeamRepository.countByEventId(event.getId());
        return toSummary(event, countTeams);
    }

    private EventSummaryResponse toSummary(Event e, long registeredTeams) {
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
