package com.collabyouth.dto.response;

import com.collabyouth.enums.EventFormat;
import com.collabyouth.enums.EventStatus;
import com.collabyouth.enums.EventType;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

public record EventSummaryResponse(
        UUID id,
        String title,
        String description,
        EventType eventType,
        EventStatus eventStatus,
        EventFormat eventFormat,
        String location,
        OffsetDateTime startsAt,
        OffsetDateTime endsAt,
        Integer maxTeams,
        Short minTeamSize,
        Short maxTeamSize,
        String prizeFirst,   // ← Changement ici
        String prizeSecond,  // ← Changement ici
        String prizeThird,   // ← Changement ici
        Set<String> tags,
        long registeredTeams   // nombre d'équipes inscrites
) {}