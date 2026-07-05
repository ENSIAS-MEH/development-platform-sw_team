package com.collabyouth.dto.response;

public record StudentStatsResponse(
    long eventsJoined,
    long teamsFormed,
    long pendingInvites,
    long profileViews
) {}