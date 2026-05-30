package com.collabyouth.service;

import com.collabyouth.dto.request.StudentProfileRequest;
import com.collabyouth.dto.response.StudentProfileResponse;
import com.collabyouth.entity.Skill;
import com.collabyouth.entity.User;
import com.collabyouth.entity.UserProfile;
import com.collabyouth.repository.SkillRepository;
import com.collabyouth.repository.UserProfileRepository;
import com.collabyouth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StudentProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final SkillRepository skillRepository;

    public StudentProfileService(UserRepository userRepository,
                                 UserProfileRepository profileRepository,
                                 SkillRepository skillRepository) {
        this.userRepository  = userRepository;
        this.profileRepository = profileRepository;
        this.skillRepository   = skillRepository;
    }

    // ── GET /api/student/profile ─────────────────────────────────────

    @Transactional(readOnly = true)
    public StudentProfileResponse getMyProfile() {
        User user = currentUser();

        UserProfile profile = profileRepository
                .findByUserIdWithSkills(user.getId())
                .orElse(null);           // profile may not exist yet — return empty shell

        return toResponse(user, profile);
    }

    // ── PUT /api/student/profile ─────────────────────────────────────

    @Transactional
    public StudentProfileResponse updateMyProfile(StudentProfileRequest request) {
        User user = currentUser();

        // Find or create the profile row
        UserProfile profile = profileRepository
                .findByUserId(user.getId())
                .orElseGet(() -> UserProfile.builder().user(user).build());

        // Patch every field that is present in the request
        if (request.getBio()          != null) profile.setBio(request.getBio());
        if (request.getDomain()       != null) profile.setDomain(request.getDomain());
        if (request.getInstitution()  != null) profile.setInstitution(request.getInstitution());
        if (request.getStudyYear()    != null) profile.setStudyYear(request.getStudyYear());
        if (request.getAvailability() != null) profile.setAvailability(request.getAvailability());
        if (request.getGithubUrl()    != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl()  != null) profile.setLinkedinUrl(request.getLinkedinUrl());

        // Skills: resolve names → entities, auto-create unknown ones
        if (request.getSkills() != null) {
            Set<Skill> resolved = resolveSkills(request.getSkills());
            profile.setSkills(resolved);
        }

        profileRepository.save(profile);
        return toResponse(user, profile);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    /**
     * Resolve a set of skill names to Skill entities.
     * Existing skills are fetched in one query; unknown ones are created on the fly.
     */
    private Set<Skill> resolveSkills(Set<String> names) {
        if (names == null || names.isEmpty()) return Set.of();

        Set<String> normalised = names.stream()
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toSet());

        // Bulk-fetch existing
        Set<Skill> existing = skillRepository.findByNameIgnoreCaseIn(normalised);
        Set<String> foundNames = existing.stream()
                .map(s -> s.getName().toLowerCase())
                .collect(Collectors.toSet());

        // Create missing ones
        Set<Skill> newSkills = normalised.stream()
                .filter(n -> !foundNames.contains(n.toLowerCase()))
                .map(n -> skillRepository.save(Skill.builder().name(n).build()))
                .collect(Collectors.toSet());

        existing.addAll(newSkills);
        return existing;
    }

    /** Map User + UserProfile (nullable) to the response DTO. */
    private StudentProfileResponse toResponse(User user, UserProfile profile) {
        Set<String> skillNames = profile != null && profile.getSkills() != null
                ? profile.getSkills().stream().map(Skill::getName).collect(Collectors.toSet())
                : Set.of();

        return StudentProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .bio(profile != null ? profile.getBio() : null)
                .domain(profile != null ? profile.getDomain() : null)
                .institution(profile != null ? profile.getInstitution() : null)
                .studyYear(profile != null ? profile.getStudyYear() : null)
                .availability(profile != null ? profile.getAvailability() : null)
                .githubUrl(profile != null ? profile.getGithubUrl() : null)
                .linkedinUrl(profile != null ? profile.getLinkedinUrl() : null)
                .skills(skillNames)
                .build();
    }

    /** Resolve the authenticated user from the security context. */
    private User currentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }
}
