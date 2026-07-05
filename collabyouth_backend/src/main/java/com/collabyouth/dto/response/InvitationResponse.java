package com.collabyouth.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record InvitationResponse(
    UUID id,
    String fromName,
    String eventTitle,
    OffsetDateTime sentAt
) {}