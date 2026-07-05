package com.collabyouth.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class UserSummaryResponse {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String status;
    private OffsetDateTime createdAt;
}