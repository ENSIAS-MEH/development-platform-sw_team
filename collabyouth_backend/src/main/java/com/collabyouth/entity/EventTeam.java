package com.collabyouth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_teams")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "registered_at", nullable = false)
    @Builder.Default
    private OffsetDateTime registeredAt = OffsetDateTime.now();
}