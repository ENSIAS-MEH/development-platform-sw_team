package com.collabyouth.dto.response;

public record OrgDashboardStats(
        long totalEvents,
        long activeEvents,
        long totalTeams,
        double avgFillRate
) {}