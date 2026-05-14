package com.collabyouth.controller;

import com.collabyouth.dto.request.LoginRequest;
import com.collabyouth.dto.request.OrgRegisterRequest;
import com.collabyouth.dto.request.RegisterRequest;
import com.collabyouth.dto.response.AuthResponse;
import com.collabyouth.dto.response.MessageResponse;
import com.collabyouth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ----------------------------------------------------------------
    // User endpoints
    // ----------------------------------------------------------------
    @PostMapping("/api/auth/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerUser(request));
    }

    @PostMapping("/api/auth/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginUser(request));
    }

    // ----------------------------------------------------------------
    // Organization endpoints
    // ----------------------------------------------------------------
    @PostMapping("/api/org/auth/register")
    public ResponseEntity<MessageResponse> registerOrg(@Valid @RequestBody OrgRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerOrg(request));
    }

    @PostMapping("/api/org/auth/login")
    public ResponseEntity<AuthResponse> loginOrg(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginOrg(request));
    }
}
