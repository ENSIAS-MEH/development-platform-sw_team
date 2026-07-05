package com.collabyouth.controller;

import com.collabyouth.dto.response.StudentSummaryResponse;
import com.collabyouth.service.StudentSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@PreAuthorize("hasRole('STUDENT')")
public class StudentSearchController {

    private final StudentSearchService searchService;

    public StudentSearchController(StudentSearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * GET /api/students
     *
     * Query params (all optional):
     *   q            — free-text search (name, email, bio)
     *   domain       — exact domain filter  e.g. "Web Development"
     *   availability — exact value          e.g. "FULL_TIME"
     *   skill        — single skill name    e.g. "React"
     *   page         — 1-based page number  (default 1)
     *   limit        — page size            (default 12, max 50)
     *
     * Response:
     * {
     *   "students": [...],
     *   "total": 42,
     *   "page": 1,
     *   "limit": 12,
     *   "pages": 4
     * }
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> searchStudents(
            @RequestParam(required = false)                  String q,
            @RequestParam(required = false)                  String domain,
            @RequestParam(required = false)                  String availability,
            @RequestParam(required = false)                  String skill,
            @RequestParam(defaultValue = "1")                int    page,
            @RequestParam(defaultValue = "12")               int    limit
    ) {
        return ResponseEntity.ok(
                searchService.searchStudents(q, domain, availability, skill, page, limit)
        );
    }

    /**
     * GET /api/students/suggested
     *
     * Returns students who share skills with the authenticated user.
     * Used by the dashboard "Suggested partners" widget.
     *
     * Query params:
     *   limit — max results (default 4, max 20)
     */
    @GetMapping("/suggested")
    public ResponseEntity<List<StudentSummaryResponse>> getSuggested(
            @RequestParam(defaultValue = "4") int limit
    ) {
        return ResponseEntity.ok(searchService.getSuggestedPartners(limit));
    }
}
