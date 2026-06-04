package com.collabyouth.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EventParticipantTeamResponse(
        UUID teamId,
        String teamName,
        String description,
        UUID createdBy,
        OffsetDateTime registeredAt
) {}