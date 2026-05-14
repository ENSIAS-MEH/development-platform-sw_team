package com.collabyouth.service;

import com.collabyouth.dto.request.LoginRequest;
import com.collabyouth.dto.request.OrgRegisterRequest;
import com.collabyouth.dto.request.RegisterRequest;
import com.collabyouth.dto.response.AuthResponse;
import com.collabyouth.dto.response.MessageResponse;
import com.collabyouth.entity.Organization;
import com.collabyouth.entity.User;
import com.collabyouth.enums.AccountStatus;
import com.collabyouth.repository.OrganizationRepository;
import com.collabyouth.repository.UserRepository;
import com.collabyouth.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ----------------------------------------------------------------
    // User register
    // ----------------------------------------------------------------
    public MessageResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        userRepository.save(user);

        return new MessageResponse("Account created successfully");
    }

    // ----------------------------------------------------------------
    // User login
    // ----------------------------------------------------------------
    public AuthResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new RuntimeException("Your account is not active");
        }

        String role = "ROLE_" + user.getRole().name();
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), role);

        return new AuthResponse(token, role);
    }

    // ----------------------------------------------------------------
    // Organization register
    // ----------------------------------------------------------------
    public MessageResponse registerOrg(OrgRegisterRequest request) {
        if (organizationRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already in use");
        }

        Organization org = Organization.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .description(request.description())
                .websiteUrl(request.websiteUrl())
                .location(request.location())
                .build();

        organizationRepository.save(org);

        return new MessageResponse("Organization registered successfully. Pending admin approval.");
    }

    // ----------------------------------------------------------------
    // Organization login
    // ----------------------------------------------------------------
    public AuthResponse loginOrg(LoginRequest request) {
        Organization org = organizationRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), org.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (org.getStatus() != AccountStatus.ACTIVE) {
            throw new RuntimeException("Your account is pending admin approval");
        }

        String token = jwtUtil.generateToken(org.getId(), org.getEmail(), "ROLE_ORG");

        return new AuthResponse(token, "ROLE_ORG");
    }
}
