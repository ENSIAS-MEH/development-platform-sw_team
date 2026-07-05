package com.collabyouth.dto.request;

import com.collabyouth.enums.EventFormat;
import com.collabyouth.enums.EventType;
import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;
import java.util.Set;

public record UpdateEventRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull EventType eventType,
        @NotNull EventFormat eventFormat,
        @NotBlank String location,
        @NotNull OffsetDateTime startsAt,
        @NotNull OffsetDateTime endsAt,
        @NotNull Integer maxTeams,
        @NotNull Short minTeamSize,
        @NotNull Short maxTeamSize,
        @NotBlank String prizeFirst,
        String prizeSecond,
        String prizeThird,
        Set<String> tags
) {}