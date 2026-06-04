package com.collabyouth.controller;

import com.collabyouth.dto.response.EventSummaryResponse;
import com.collabyouth.service.PublicEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@PreAuthorize("hasRole('STUDENT')")
public class PublicEventController {

    private final PublicEventService publicEventService;

    public PublicEventController(PublicEventService publicEventService) {
        this.publicEventService = publicEventService;
    }

    /**
     * GET /api/events
     * Utilisé par EventsPage (avec filtres optionnels) et par StudentDashboard (?limit=4)
     */
    @GetMapping
    public ResponseEntity<List<EventSummaryResponse>> getEventsForStudents(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer limit) {
        
        List<EventSummaryResponse> events = publicEventService.getPublishedEvents(type, q, limit);
        return ResponseEntity.ok(events);
    }
}