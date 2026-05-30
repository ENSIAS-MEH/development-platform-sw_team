package com.collabyouth.controller;

import com.collabyouth.dto.request.StudentProfileRequest;
import com.collabyouth.dto.response.StudentProfileResponse;
import com.collabyouth.service.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentProfileService profileService;

    public StudentController(StudentProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * GET /api/student/profile
     * Returns the authenticated student's profile.
     * If no profile row exists yet, returns a shell with just the User fields.
     */
    @GetMapping("/profile")
    public ResponseEntity<StudentProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    /**
     * PUT /api/student/profile
     * Creates or updates the authenticated student's profile.
     * Only fields present in the request body are updated (partial update).
     */
    @PutMapping("/profile")
    public ResponseEntity<StudentProfileResponse> updateProfile(
            @Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }
}
