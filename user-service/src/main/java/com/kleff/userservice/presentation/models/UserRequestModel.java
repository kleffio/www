package com.kleff.userservice.presentation.models;

public record UserRequestModel(
        String name,
        String email,
        String phone,
        String theme,
        String timezone,
        Boolean marketingEmails
) {}
