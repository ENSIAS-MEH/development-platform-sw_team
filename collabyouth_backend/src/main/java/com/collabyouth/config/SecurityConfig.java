package com.collabyouth.config;

import com.collabyouth.security.JwtFilter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity 
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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

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

    // 🚨 CORRECTION 1 : On déclare explicitement un AuthenticationManager qui englobe les DEUX providers
    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(List.of(userAuthProvider(), orgAuthProvider()));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable) // Désactive le CSRF pour éviter les 403 sur les POST
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 1. Autoriser explicitement les requêtes de vérification CORS (Pre-flight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // 2. Routes publiques (L'authentification DOIT être accessible à tous !)
                .requestMatchers("/api/auth/**", "/api/org/auth/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                // 3. Routes sécurisées par rôles
                .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                .requestMatchers("/api/org/**").hasAnyAuthority("ORG", "ROLE_ORG")
                
                // 🚨 CORRECTION 2 : On englobe TOUTES les routes étudiantes et événementielles pour STUDENT
                .requestMatchers("/api/student/**", "/api/students/**", "/api/events/**", "/api/invitations/**").hasAnyAuthority("STUDENT", "ROLE_STUDENT", "ADMIN", "ROLE_ADMIN")
                
                // Tout le reste demande simplement d'être connecté
                .anyRequest().authenticated()
            )
            // 🚨 CORRECTION 3 : On lie le gestionnaire d'authentification configuré
            .authenticationManager(authenticationManager())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001", "http://localhost:3002"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}