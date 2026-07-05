package com.collabyouth.dto.request;

import com.collabyouth.enums.EventFormat;
import com.collabyouth.enums.EventType;
import jakarta.validation.constraints.*;

import java.time.OffsetDateTime;
import java.util.Set;

public record CreateEventRequest(

        @NotBlank(message = "Le titre est obligatoire")
        String title,

        @NotBlank(message = "La description est obligatoire")
        String description,

        @NotNull(message = "Le type d'événement est obligatoire")
        EventType eventType,

        @NotNull(message = "Le format est obligatoire")
        EventFormat eventFormat,

        @NotBlank(message = "Le lieu est obligatoire")
        String location,

        @NotNull(message = "La date de début est obligatoire")
        // @Future(message = "La date de début doit être dans le futur")
        OffsetDateTime startsAt,

        @NotNull(message = "La date de fin est obligatoire")
        OffsetDateTime endsAt,

        @NotNull(message = "Le nombre max d'équipes est obligatoire")
        @Min(value = 1, message = "Au moins 1 équipe")
        Integer maxTeams,

        @NotNull(message = "La taille min d'équipe est obligatoire")
        @Min(value = 1, message = "Minimum 1 membre")
        Short minTeamSize,

        @NotNull(message = "La taille max d'équipe est obligatoire")
        Short maxTeamSize,

        @NotBlank(message = "Le prix/récompense est obligatoire")
       String prizeFirst,
        String prizeSecond,
        String prizeThird,

        @NotEmpty(message = "Au moins un thème est obligatoire")
        Set<String> tags
) {}