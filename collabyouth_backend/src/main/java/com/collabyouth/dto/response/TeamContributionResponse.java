package com.collabyouth.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.collabyouth.dto.response.TeamContributionResponse;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamContributionResponse {
    private String id;
    private String teamName;
    private String eventName;
    private String eventType; // HACKATHON, CHALLENGE, WORKSHOP
    private String role;      // ADMIN ou MEMBER
    private long membersCount;
    private int maxTeamSize;
    private String registeredAt;
    private String eventStatus; // PUBLISHED, CLOSED
}