package com.collabyouth.service;

import com.collabyouth.dto.response.StudentSummaryResponse;
import com.collabyouth.entity.Skill;
import com.collabyouth.entity.User;
import com.collabyouth.entity.UserProfile;
import com.collabyouth.repository.StudentSearchRepository;
import com.collabyouth.repository.UserProfileRepository;
import com.collabyouth.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StudentSearchService {

    private final StudentSearchRepository searchRepository;
    private final UserProfileRepository   profileRepository;
    private final UserRepository          userRepository;

    public StudentSearchService(StudentSearchRepository searchRepository,
                                UserProfileRepository profileRepository,
                                UserRepository userRepository) {
        this.searchRepository  = searchRepository;
        this.profileRepository = profileRepository;
        this.userRepository    = userRepository;
    }

    // ── GET /api/students ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> searchStudents(String q,
                                              String domain,
                                              String availability,
                                              String skill,
                                              int page,
                                              int limit) {
        User me = currentUser();

        String qParam            = isBlank(q)            ? null : q.trim();
        String domainParam       = isBlank(domain)       ? null : domain.trim();
        String availabilityParam = isBlank(availability) ? null : availability.trim();
        String skillParam        = isBlank(skill)        ? null : skill.trim();

        Pageable pageable = PageRequest.of(
                Math.max(0, page - 1),
                Math.min(limit, 50)
        );

        Page<UserProfile> resultPage = searchRepository.searchStudents(
                qParam, domainParam, availabilityParam, skillParam,
                me.getId(), pageable
        );

        List<StudentSummaryResponse> students = resultPage.getContent()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return Map.of(
                "students", students,
                "total",    resultPage.getTotalElements(),
                "page",     page,
                "limit",    limit,
                "pages",    resultPage.getTotalPages()
        );
    }

    // ── GET /api/students/suggested ──────────────────────────────────

    @Transactional(readOnly = true)
    public List<StudentSummaryResponse> getSuggestedPartners(int limit) {
        User me = currentUser();

        Set<String> mySkills = profileRepository
                .findByUserIdWithSkills(me.getId())
                .map(p -> p.getSkills().stream()
                        .map(Skill::getName)
                        .collect(Collectors.toSet()))
                .orElse(Set.of());

        Pageable pageable = PageRequest.of(0, Math.min(limit, 20));

        Page<UserProfile> results = mySkills.isEmpty()
                ? searchRepository.searchStudents(null, null, null, null, me.getId(), pageable)
                : searchRepository.findSuggestedPartners(me.getId(), mySkills.toArray(new String[0]), pageable);

        return results.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private StudentSummaryResponse toResponse(UserProfile profile) {
        User user = profile.getUser();
        Set<String> skillNames = profile.getSkills() == null
                ? Set.of()
                : profile.getSkills().stream()
                        .map(Skill::getName)
                        .collect(Collectors.toSet());

        return StudentSummaryResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .bio(profile.getBio())
                .domain(profile.getDomain())
                .institution(profile.getInstitution())
                .studyYear(profile.getStudyYear())
                .availability(profile.getAvailability())
                .githubUrl(profile.getGithubUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .skills(skillNames)
                .build();
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}