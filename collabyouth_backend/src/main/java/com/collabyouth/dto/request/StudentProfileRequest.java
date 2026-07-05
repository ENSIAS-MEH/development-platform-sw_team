package com.collabyouth.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class StudentProfileRequest {

    @Size(max = 2000, message = "Bio must be under 2000 characters")
    private String bio;

    @Size(max = 150, message = "Domain must be under 150 characters")
    private String domain;

    @Size(max = 200, message = "Institution must be under 200 characters")
    private String institution;

    private Short studyYear;

    @Size(max = 100, message = "Availability must be under 100 characters")
    private String availability;

    @Size(max = 255, message = "GitHub URL must be under 255 characters")
    private String githubUrl;

    @Size(max = 255, message = "LinkedIn URL must be under 255 characters")
    private String linkedinUrl;

    // Skill names — resolved to Skill entities in the service
    private Set<String> skills;
}
