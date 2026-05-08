package com.collabyouth.dto.response;

import java.util.UUID;

public record UserSummaryResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String role,
        String status
) {}
