package com.collabyouth.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record EventParticipantTeamResponse(
        UUID teamId,
        String teamName,
        String description,
        String leaderName,
        OffsetDateTime registeredAt,
        List<TeamMemberInfo> members
) {
    public record TeamMemberInfo(
            UUID userId,
            String fullName,
            String role
    ) {}
}
