package com.collabyouth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrgRegisterRequest(

        @NotBlank(message = "Organization name is required")
        @Size(max = 200)
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 255)
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @Size(max = 255)
        String description,

        @Size(max = 255)
        String websiteUrl,

        @Size(max = 200)
        String location
) {}
