package com.collabyouth.dto.response;

public record AuthResponse(
        String token,
        String role
) {}
