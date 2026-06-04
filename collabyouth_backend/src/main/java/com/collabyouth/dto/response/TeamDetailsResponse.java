package com.collabyouth.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TeamDetailsResponse {
    private String teamId;
    private String teamName;
    private String description;
    private String createdAt;
    private EventInfo event;
    private List<MemberInfo> members;

    @Data
    @Builder
    public static class EventInfo {
        private String id;
        private String title;
        private String description;
        private String eventType;
        private String eventFormat;
        private String location;
        private String startsAt;
        private String endsAt;
        private int minTeamSize;
        private int maxTeamSize;
        
        // CORRECTION : Les 3 prix remplacent l'ancien champ unique
        private String prizeFirst;
        private String prizeSecond;
        private String prizeThird;
    }

    @Data
    @Builder
    public static class MemberInfo {
        private String userId;
        private String firstName;
        private String lastName;
        private String email;
        private String role; 
    }
}