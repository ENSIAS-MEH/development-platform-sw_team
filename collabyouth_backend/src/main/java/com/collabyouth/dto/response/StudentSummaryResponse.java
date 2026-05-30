package com.collabyouth.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.Set;
import java.util.UUID;

@Getter
@Builder
public class StudentSummaryResponse {

    // From User
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;

    // From UserProfile
    private String bio;
    private String domain;
    private String institution;
    private Short studyYear;
    private String availability;
    private String githubUrl;
    private String linkedinUrl;
    private Set<String> skills;
}
