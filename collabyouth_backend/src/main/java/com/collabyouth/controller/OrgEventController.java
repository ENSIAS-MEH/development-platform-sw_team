package com.collabyouth.controller;

import com.collabyouth.dto.request.CreateEventRequest;
import com.collabyouth.dto.request.UpdateEventRequest; // NOUVEAU
import com.collabyouth.dto.response.EventParticipantTeamResponse; // NOUVEAU
import com.collabyouth.dto.response.EventSummaryResponse;
import com.collabyouth.dto.response.OrgDashboardStats;
import com.collabyouth.security.JwtUtil;
import com.collabyouth.service.OrgEventService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/org")
@PreAuthorize("hasRole('ORG')")
public class OrgEventController {

    private final OrgEventService orgEventService;
    private final JwtUtil jwtUtil;

    public OrgEventController(OrgEventService orgEventService, JwtUtil jwtUtil) {
        this.orgEventService = orgEventService;
        this.jwtUtil = jwtUtil;
    }

    private UUID extractOrgId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        // Une petite sécurité au cas où le header est mal formé
        if (header == null || !header.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Token JWT manquant ou invalide");
        }
        String token = header.substring(7);
        return jwtUtil.extractId(token);
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventSummaryResponse>> getMyEvents(HttpServletRequest request) {
        UUID orgId = extractOrgId(request);
        return ResponseEntity.ok(orgEventService.getOrgEvents(orgId));
    }

    @GetMapping("/events/stats")
    public ResponseEntity<OrgDashboardStats> getMyStats(HttpServletRequest request) {
        UUID orgId = extractOrgId(request);
        return ResponseEntity.ok(orgEventService.getOrgStats(orgId));
    }

    @PostMapping("/events")
    public ResponseEntity<EventSummaryResponse> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            HttpServletRequest httpRequest) {
        UUID orgId = extractOrgId(httpRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(orgEventService.createEvent(orgId, request));
    }

    // ----------------------------------------------------------------
    // NOUVEAU : Modifier un événement
    // URL : PUT /api/org/events/{eventId}
    // ----------------------------------------------------------------
    @PutMapping("/events/{eventId}")
    public ResponseEntity<EventSummaryResponse> updateEvent(
            @PathVariable UUID eventId,
            @Valid @RequestBody UpdateEventRequest request,
            HttpServletRequest httpRequest) {
        UUID orgId = extractOrgId(httpRequest);
        return ResponseEntity.ok(orgEventService.updateEvent(orgId, eventId, request));
    }

    // ----------------------------------------------------------------
    // NOUVEAU : Voir les participants (équipes) d'un événement
    // URL : GET /api/org/events/{eventId}/participants
    // ----------------------------------------------------------------
    @GetMapping("/events/{eventId}/participants")
    public ResponseEntity<List<EventParticipantTeamResponse>> getEventParticipants(
            @PathVariable UUID eventId,
            HttpServletRequest httpRequest) {
        UUID orgId = extractOrgId(httpRequest);
        return ResponseEntity.ok(orgEventService.getEventParticipants(orgId, eventId));
    }

    // ----------------------------------------------------------------
    // NOUVEAU : Clôturer un événement
    // URL : POST /api/org/events/{eventId}/close
    // ----------------------------------------------------------------
    @PostMapping("/events/{eventId}/close")
    public ResponseEntity<EventSummaryResponse> closeEvent(
            @PathVariable UUID eventId,
            HttpServletRequest httpRequest) {
        UUID orgId =
         extractOrgId(httpRequest);
        return ResponseEntity.ok(orgEventService.closeEvent(orgId, eventId));
    }
    @GetMapping("/events/{eventId}")
    public ResponseEntity<EventSummaryResponse> getEventDetails(
            @PathVariable UUID eventId,
            HttpServletRequest httpRequest) {
        UUID orgId = extractOrgId(httpRequest);
        return ResponseEntity.ok(orgEventService.getEventDetails(orgId, eventId));
    }
}