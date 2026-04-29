package com.collabyouth.config;

import com.collabyouth.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Qualifier;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserDetailsService userDetailsService;
    private final UserDetailsService orgDetailsService;

    public SecurityConfig(
            JwtFilter jwtFilter,
            @Qualifier("userDetailsService") UserDetailsService userDetailsService,
            @Qualifier("orgDetailsService") UserDetailsService orgDetailsService) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
        this.orgDetailsService = orgDetailsService;
    }

    // ----------------------------------------------------------------
    // Password encoder — BCrypt for both users and organizations
    // ----------------------------------------------------------------
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ----------------------------------------------------------------
    // Auth providers — one per principal type
    // ----------------------------------------------------------------
    @Bean
    public DaoAuthenticationProvider userAuthProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public DaoAuthenticationProvider orgAuthProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(orgDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // ----------------------------------------------------------------
    // Authentication manager — used in AuthService to verify credentials
    // ----------------------------------------------------------------
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // ----------------------------------------------------------------
    // Security filter chain — defines public vs protected routes
    // ----------------------------------------------------------------
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // Public routes — no token needed
                .requestMatchers(
                    "/api/auth/**",
                    "/api/org/auth/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                // Admin only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Organization only
                .requestMatchers("/api/org/**").hasRole("ORG")

                // Everything else requires a valid token
                .anyRequest().authenticated()
            )
            .authenticationProvider(userAuthProvider())
            .authenticationProvider(orgAuthProvider())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
