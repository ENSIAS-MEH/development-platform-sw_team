package com.collabyouth.dto.response;

import java.util.UUID;

public record OrgSummaryResponse(
        UUID id,       // ✅ UUID au lieu de Long
        String name,
        String email,
        String description,
        String websiteUrl,
        String location,
        String status
) {}
